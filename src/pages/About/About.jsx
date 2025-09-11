import styles from './About.module.css';

const About = () => {
    return (
        <div className={styles.aboutPage}>
            <div className={styles.hero}>
                <h1>About Coventry Motors</h1>
                <p>A Legacy of Trust and Quality Since 1998.</p>
            </div>

            <div className={styles.content}>
                <div className={styles.section}>
                    <h2>Our Story</h2>
                    <p>
                        Founded over two decades ago by the Smith family, Coventry Motors started as a small, two-bay workshop with a simple mission: to provide the local community with honest, reliable, and affordable car care. Today, we've grown into a state-of-the-art facility, but our core values remain unchanged. We are proud to be an independent, family-run business that puts our customers first.
                    </p>
                </div>

                <div className={`${styles.section} ${styles.commitmentSection}`}>
                    <h2>Our Commitment to You</h2>
                    <ul>
                        <li><strong>Honest Advice:</strong> We only recommend work that is genuinely needed and provide clear, jargon-free explanations.</li>
                        <li><strong>Quality Parts:</strong> We use only OEM or equivalent quality parts to ensure the longevity and performance of your vehicle.</li>
                        <li><strong>Transparent Pricing:</strong> You'll receive a detailed quote before any work begins, with no hidden fees or surprises.</li>
                        <li><strong>Skilled Technicians:</strong> Our team is fully qualified and regularly trained on the latest vehicle technologies.</li>
                    </ul>
                </div>

                <div className={styles.section}>
                    <h2>Meet the Team</h2>
                    <div className={styles.teamGrid}>
                        <div className={styles.teamMember}>
                            <h3>John Smith</h3>
                            <p>Founder & Master Technician</p>
                        </div>
                        <div className={styles.teamMember}>
                            <h3>Sarah Jones</h3>
                            <p>Service Manager</p>
                        </div>
                        <div className={styles.teamMember}>
                            <h3>David Chen</h3>
                            <p>MOT Specialist</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;