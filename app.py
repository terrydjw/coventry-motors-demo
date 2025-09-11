import os
import json
import datetime
import re
from dotenv import load_dotenv
from zoneinfo import ZoneInfo

from flask import Flask, request, jsonify
from flask_cors import CORS

# --- Google & AI Imports ---
import google.generativeai as genai
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings

# --- Google Calendar Imports ---
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

# ==============================================================================
# 1. INITIAL SETUP & CONFIGURATION (No Changes)
# ==============================================================================
load_dotenv()
app = Flask(__name__)
CORS(app)

try:
    with open("config.json", "r") as f: config = json.load(f)
except FileNotFoundError: raise RuntimeError("config.json not found.")

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gemini_model = genai.GenerativeModel('gemini-2.5-flash')
conversation_state = {}

# ==============================================================================
# 2. KNOWLEDGE BASE & RAG SETUP (No Changes)
# ==============================================================================
# --- Function load_and_process_knowledge_base is unchanged ---
def load_and_process_knowledge_base():
    try:
        with open(config["knowledge_base_path"], "r") as f: knowledge_base_text = f.read()
        pricing_info = "\n\n## Our Prices\n"
        for service, price in config["price_list"].items(): pricing_info += f"- **{service}**: £{price}\n"
        full_knowledge_text = knowledge_base_text + pricing_info
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        chunks = text_splitter.split_text(full_knowledge_text)
        api_key = os.getenv("GEMINI_API_KEY")
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=api_key)
        vector_store = FAISS.from_texts(chunks, embeddings)
        print("Knowledge base loaded.")
        return vector_store
    except Exception as e:
        print(f"Error loading knowledge base: {e}")
        return None
vector_store = load_and_process_knowledge_base()

# ==============================================================================
# 3. DEFINITIVE GOOGLE CALENDAR FUNCTIONS
# ==============================================================================
def get_calendar_service():
    creds = None
    if os.path.exists(config["google_token_path"]):
        creds = Credentials.from_authorized_user_file(config["google_token_path"])
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token: creds.refresh(Request())
        else: raise RuntimeError("Google Calendar credentials are not valid.")
    return build("calendar", "v3", credentials=creds)

def find_available_slots():
    service = get_calendar_service()
    london_tz = ZoneInfo("Europe/London")
    now = datetime.datetime.now(london_tz)
    start_of_tomorrow = (now + datetime.timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    time_min, time_max = start_of_tomorrow.isoformat(), (start_of_tomorrow + datetime.timedelta(days=14)).isoformat()
    body = {"timeMin": time_min, "timeMax": time_max, "items": [{"id": config["google_calendar_id"]}], "timeZone": "Europe/London"}
    freebusy_result = service.freebusy().query(body=body).execute()
    busy_slots = freebusy_result["calendars"][config["google_calendar_id"]]["busy"]
    available_slots_by_day, check_time = {}, start_of_tomorrow.replace(hour=9)
    while check_time < (start_of_tomorrow + datetime.timedelta(days=14)):
        if check_time.weekday() == 6: check_time += datetime.timedelta(days=1); check_time = check_time.replace(hour=9); continue
        is_busy = any(datetime.datetime.fromisoformat(busy["start"]) <= check_time < datetime.datetime.fromisoformat(busy["end"]) for busy in busy_slots)
        is_weekday = 0 <= check_time.weekday() <= 4 and 9 <= check_time.hour < 17
        is_saturday = check_time.weekday() == 5 and 9 <= check_time.hour < 13
        if not is_busy and (is_weekday or is_saturday):
            day_str, time_str = check_time.strftime("%A, %d %B"), check_time.strftime("%I:%M %p")
            if day_str not in available_slots_by_day: available_slots_by_day[day_str] = []
            if len(available_slots_by_day[day_str]) < 4: available_slots_by_day[day_str].append(time_str)
        check_time += datetime.timedelta(hours=1)
        if check_time.hour >= 17: check_time += datetime.timedelta(days=1); check_time = check_time.replace(hour=9)
    return {day: times for i, (day, times) in enumerate(available_slots_by_day.items()) if i < 3}

def create_appointment(day_str, time_str, service_name, user_details):
    """
    Creates a timezone-correct event using the robust UTC conversion method.
    """
    print("--- Starting Appointment Creation ---")
    try:
        london_tz = ZoneInfo("Europe/London")
        now = datetime.datetime.now(london_tz)

        # 1. Combine user's chosen day and time into a single string
        full_time_str = f"{day_str} {time_str}"
        print(f"Step 1: Combined user input string: '{full_time_str}'")

        # 2. Parse the string into a "naive" datetime object (no timezone info yet)
        naive_dt = datetime.datetime.strptime(full_time_str, "%A, %d %B %I:%M %p")
        print(f"Step 2: Parsed into naive datetime object: {naive_dt}")

        # 3. Create a new naive datetime with the correct year
        naive_local_dt = naive_dt.replace(year=now.year)
        print(f"Step 3: Naive datetime with current year: {naive_local_dt}")

        # 4. Make the datetime "aware" by attaching the London timezone
        aware_local_dt = naive_local_dt.replace(tzinfo=london_tz)
        print(f"Step 4: Aware datetime in London timezone: {aware_local_dt.isoformat()}")

        # 5. Handle cases where the date might be in the past (e.g., booking in Jan for Dec)
        if aware_local_dt < now:
            aware_local_dt = aware_local_dt.replace(year=now.year + 1)
            print(f"Step 5: Adjusted for next year: {aware_local_dt.isoformat()}")

        # 6. Convert the final London time to UTC. This is the bulletproof step.
        start_time_utc = aware_local_dt.astimezone(datetime.timezone.utc)
        end_time_utc = start_time_utc + datetime.timedelta(hours=1)
        print(f"Step 6: Final UTC time for API: {start_time_utc.isoformat()}")

        # 7. Create the event for Google Calendar
        event = {
            'summary': f'Booking: {service_name} for {user_details}',
            'description': f'Service: {service_name}\nCustomer: {user_details}',
            'start': {'dateTime': start_time_utc.isoformat()}, # Sending UTC
            'end': {'dateTime': end_time_utc.isoformat()},     # Sending UTC
        }
        
        service = get_calendar_service()
        created_event = service.events().insert(calendarId=config["google_calendar_id"], body=event).execute()
        print("--- Appointment Creation Successful ---")
        return f"You're all booked in! We've reserved your spot for {service_name} on {day_str} at {time_str}. We look forward to seeing you."

    except Exception as e:
        print(f"!!! ERROR in create_appointment: {e} !!!")
        return "I'm sorry, there was a technical error while creating the booking. Please try again."


# ==============================================================================
# 4. HELPER FUNCTIONS (No Changes)
# ==============================================================================
# --- Functions SERVICE_KEYWORDS, extract_service_from_message, format_history are unchanged ---
SERVICE_KEYWORDS = { "MOT Test": ["mot"], "Standard Service": ["standard service", "regular service"], "Major Service": ["major service", "full service"], "Brake Fluid Change": ["brake fluid", "fluid change"], "Air Con Recharge": ["air con", "aircon"], "Diagnostic Check": ["diagnostic", "check engine"] }
def extract_service_from_message(message):
    message_lower = message.lower()
    for service, keywords in SERVICE_KEYWORDS.items():
        if any(keyword in message_lower for keyword in keywords): return service
    return None
def format_history(history):
    if not history: return ""
    return "\n".join([f"{msg['sender'].capitalize()}: {msg['text']}" for msg in history[-4:]])

# ==============================================================================
# 5. CHATBOT LOGIC (No Changes)
# ==============================================================================
# --- Function start_booking_flow and route @app.route("/chat") are unchanged ---
def start_booking_flow(user_id, state, service_name):
    price = config["price_list"].get(service_name)
    slots_by_day = find_available_slots()
    if not slots_by_day: return {"response": "I'm sorry, I couldn't find any available slots right now. Please call us."}
    state.update({ "task": "booking", "stage": "awaiting_day_choice", "service": service_name, "available_slots_by_day": slots_by_day })
    conversation_state[user_id] = state
    available_days_str = "\n- ".join(slots_by_day.keys())
    return {"response": f"Of course. A {service_name} costs £{price:.2f}. We have availability on:\n- {available_days_str}\n\nWhich day works best for you?"}
@app.route("/chat", methods=["POST"])
def chat():
    user_id = request.remote_addr
    user_message = request.json.get("message")
    state = conversation_state.get(user_id, {"history": []})
    if user_message: state["history"].append({"sender": "user", "text": user_message})
    bot_response_text = ""
    if not user_message:
        state = {"history": []}
        bot_response_text = f"Welcome to the {config['business_name']} AI Assistant. How can I help?"
    else:
        if state.get("task") == "booking":
            if state["stage"] == "awaiting_day_choice":
                chosen_day = next((day for day in state["available_slots_by_day"] if day.split(',')[0].lower() in user_message.lower()), None)
                if chosen_day:
                    state["stage"] = "awaiting_time_choice"; state["chosen_day"] = chosen_day
                    available_times = state["available_slots_by_day"][chosen_day]
                    bot_response_text = f"Great! For {chosen_day}, we have these times: {', '.join(available_times)}. Which time would you like?"
                else: bot_response_text = "Sorry, please choose one of the available days I listed."
            elif state["stage"] == "awaiting_time_choice":
                available_times = state["available_slots_by_day"][state["chosen_day"]]
                chosen_time = None
                cleaned_user_message = user_message.lower().replace(" ", "")
                for t in available_times:
                    if cleaned_user_message in t.lower().replace(" ", ""): chosen_time = t; break
                if not chosen_time:
                    match = re.search(r'(\d{1,2})', user_message)
                    if match: hour_str = match.group(1); chosen_time = next((t for t in available_times if t.startswith(f"{int(hour_str):02d}")), None)
                if chosen_time:
                    state.update({"stage": "awaiting_details", "chosen_time": chosen_time})
                    bot_response_text = f"Perfect. To finalize your booking for {state['chosen_day']} at {chosen_time}, please provide your full name and a contact number."
                else: bot_response_text = f"Sorry, we don't have that slot. Please pick one of these times: {', '.join(available_times)}"
            elif state["stage"] == "awaiting_details":
                if "cancel" in user_message.lower():
                    state = {"history": state["history"]}; bot_response_text = "No problem, the booking has been cancelled."
                else:
                    bot_response_text = create_appointment(state["chosen_day"], state["chosen_time"], state["service"], user_message)
                    state = {"history": state["history"]}
        else:
            service_mentioned = extract_service_from_message(user_message)
            if service_mentioned: state["last_mentioned_service"] = service_mentioned
            is_booking_intent = any(keyword in user_message.lower() for keyword in ["book", "appointment", "schedule", "can i book", "book in"])
            if is_booking_intent:
                service_to_book = state.get("last_mentioned_service")
                if service_to_book:
                    response_data = start_booking_flow(user_id, state, service_to_book)
                    bot_response_text = response_data["response"]
                else:
                    state["task"] = "booking"; state["stage"] = "awaiting_service"
                    bot_response_text = "I can certainly help with that. What service are you looking to book?"
            elif state.get("task") == "booking" and state["stage"] == "awaiting_service":
                service_to_book = state.get("last_mentioned_service")
                if service_to_book:
                     response_data = start_booking_flow(user_id, state, service_to_book)
                     bot_response_text = response_data["response"]
                else: bot_response_text = "I'm sorry, I don't recognise that service."
            else:
                if vector_store:
                    relevant_docs = vector_store.similarity_search(user_message, k=3)
                    context, chat_history = "\n".join([doc.page_content for doc in relevant_docs]), format_history(state["history"])
                    prompt = f"You are a helpful AI assistant... RECENT CONVERSATION HISTORY:\n{chat_history}\n\nRELEVANT KNOWLEDGE BASE INFO:\n\"{context}\"\n\n...answer the user's latest message: \"{user_message}\""
                    ai_response = gemini_model.generate_content(prompt)
                    bot_response_text = ai_response.text
                else: bot_response_text = "Sorry, my knowledge base is currently unavailable."
    state["history"].append({"sender": "bot", "text": bot_response_text})
    state["history"] = state["history"][-10:]
    conversation_state[user_id] = state
    return jsonify({"response": bot_response_text})

if __name__ == "__main__":
    app.run(debug=True)