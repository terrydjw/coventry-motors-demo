import styles from './Home.module.css';
import backgroundImage from '../../assets/background.jpg';

const Home = () => {
    // This function will find and click the chat toggle button in the Chatbot component
    const openChat = () => {
        const chatButton = document.querySelector('#chat-toggle-button');
        if (chatButton && chatButton.getAttribute('aria-expanded') === 'false') {
            chatButton.click();
        }
    };

    return (
        <div className={styles.home}>
            {/* HERO SECTION (No changes) */}
            <div className={styles.hero} style={{ backgroundImage: `url(${backgroundImage})` }}>
                <div className={styles.heroOverlay}></div>
                <div className={styles.heroContent}>
                    <h2>Your Trusted, Local Garage in Coventry</h2>
                    <p>Honest Workmanship. Fair Prices. Unbeatable Service.</p>
                    <a href="/contact" className={styles.ctaButton}>Book Now</a>
                </div>
            </div>

            {/* SERVICES SECTION (No changes) */}
            <div className={styles.contentSection}>
                <h2>Our Core Services</h2>
                <div className={styles.servicesGrid}>
                    <div className={styles.serviceCard}>
                        <h3>MOT Testing</h3>
                        <p>DVSA-approved MOT testing for all Class 4 vehicles to ensure your car is safe and roadworthy.</p>
                    </div>
                    <div className={styles.serviceCard}>
                        <h3>Vehicle Servicing</h3>
                        <p>From standard oil changes to major services, we keep your car running smoothly and reliably.</p>
                    </div>
                    <div className={styles.serviceCard}>
                        <h3>Diagnostics & Repairs</h3>
                        <p>Using the latest diagnostic tools, we accurately identify and fix any issue your vehicle may have.</p>
                    </div>
                </div>
            </div>

            {/* --- NEW AI ASSISTANT SECTION --- */}
            <div className={styles.aiSection}>
                <div className={styles.aiContent}>
                    <h2>Meet Your 24/7 AI Assistant</h2>
                    <p>
                        No need to wait for opening hours. Our intelligent AI assistant is here to help you anytime, day or night. Get instant answers and manage your bookings on your schedule.
                    </p>
                    <ul className={styles.aiFeatures}>
                        <li>Get Instant Price Estimates</li>
                        <li>Book Appointments in Real-Time</li>
                        <li>Ask About Our Services</li>
                    </ul>
                    <button onClick={openChat} className={styles.ctaButton}>
                        Try it Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;