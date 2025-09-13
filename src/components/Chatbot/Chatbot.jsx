import { useState, useEffect, useRef } from 'react';
import styles from './Chatbot.module.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showQuickReplies, setShowQuickReplies] = useState(false);
    const chatWindowRef = useRef(null);

    const quickReplies = ["Get a Price Estimate", "Book an MOT", "Ask a Question"];

    const scrollToBottom = () => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setIsTyping(true);
            fetch('https://api.verndigital.com/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: '' }),
            })
                .then(res => res.json())
                .then(data => {
                    setMessages([{ text: data.response, sender: 'bot' }]);
                    setShowQuickReplies(true);
                    setIsTyping(false);
                })
                .catch(error => {
                    console.error("Error fetching initial message:", error);
                    setMessages([{ text: "Sorry, I'm having trouble connecting.", sender: 'bot' }]);
                    setIsTyping(false);
                });
        }
    }, [isOpen, messages.length]);

    const sendMessage = async (messageText) => {
        if (messageText.trim() === '') return;

        const newMessages = [...messages, { text: messageText, sender: 'user' }];
        setMessages(newMessages);
        setUserInput('');
        setIsTyping(true);
        setShowQuickReplies(false);

        try {
            const response = await fetch('https://api.verndigital.com/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageText }),
            });
            const data = await response.json();
            setMessages([...newMessages, { text: data.response, sender: 'bot' }]);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages([...newMessages, { text: "Sorry, something went wrong.", sender: 'bot' }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        sendMessage(userInput);
    };

    const handleQuickReplyClick = (reply) => {
        sendMessage(reply);
    };

    return (
        <div>
            <button
                id="chat-toggle-button"
                className={styles.chatToggleButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                {isOpen ? 'X' : 'AI'}
            </button>

            {isOpen && (
                <div className={styles.chatWidget}>
                    <div className={styles.chatHeader}>
                        <h2>AI Assistant</h2>
                    </div>
                    <div ref={chatWindowRef} className={styles.chatWindow}>
                        {messages.map((msg, index) => (
                            <div key={index} className={`${styles.message} ${msg.sender === 'user' ? styles.userMessage : styles.botMessage}`}>
                                {msg.text}
                            </div>
                        ))}
                        {showQuickReplies && (
                            <div className={styles.quickReplies}>
                                {quickReplies.map((reply, index) => (
                                    <button key={index} onClick={() => handleQuickReplyClick(reply)} className={styles.quickReplyButton}>
                                        {reply}
                                    </button>
                                ))}
                            </div>
                        )}
                        {isTyping && (
                            <div className={`${styles.message} ${styles.botMessage}`}>
                                <div className={styles.typingDot}></div>
                                <div className={styles.typingDot}></div>
                                <div className={styles.typingDot}></div>
                            </div>
                        )}
                    </div>
                    <form className={styles.chatInputArea} onSubmit={handleFormSubmit}>
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Type a message..."
                        />
                        <button type="submit">Send</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot;