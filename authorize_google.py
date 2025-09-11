import os.path
import json
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

# Load client config
with open("config.json", "r") as f:
    config = json.load(f)

SCOPES = ["https://www.googleapis.com/auth/calendar"]
CREDENTIALS_FILE = config["google_credentials_path"]
TOKEN_FILE = config["google_token_path"]

def main():
    """Shows basic usage of the Google Calendar API.
    Logs in and saves credentials for future use.
    """
    creds = None
    if os.path.exists(TOKEN_FILE):
        print("Token file already exists.")
        return

    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                CREDENTIALS_FILE, SCOPES
            )
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open(TOKEN_FILE, "w") as token:
            token.write(creds.to_json())
            print(f"Token saved to {TOKEN_FILE}")

if __name__ == "__main__":
    main()