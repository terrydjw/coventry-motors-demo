import styles from './Contact.module.css';

const Contact = () => {
    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Thank you for your message! We will get back to you shortly.");
        e.target.reset();
    };

    return (
        <div className={styles.contactPage}>
            <div className={styles.hero}>
                <h1>Contact Us</h1>
                <p>We're here to help. Get in touch with us today.</p>
            </div>

            <div className={styles.contactLayout}>
                <div className={styles.details}>
                    <h2>Our Information</h2>
                    <p><strong>Address:</strong> 7 Bishop Street, Coventry, CV1 1HU</p>
                    <p><strong>Phone:</strong> <a href="tel:02476000000">024 7600 0000</a></p>
                    <p><strong>Email:</strong> <a href="mailto:contact@coventrymotors.com">contact@coventrymotors.com</a></p>

                    <h3>Opening Hours</h3>
                    <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p>Saturday: 8:30 AM - 2:00 PM</p>
                    <p>Sunday & Bank Holidays: Closed</p>

                    <div className={styles.map}>
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2433.9984992451313!2d-1.511391684196142!3d52.40804797979318!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48774914a2a11b7d%3A0x6de5553e125036b1!2sBishop%20St%2C%20Coventry%20CV1%201HU!5e0!3m2!1sen!2suk!4v1662821631584!5m2!1sen!2suk"
                            width="100%"
                            height="300"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>

                <div className={styles.formContainer}>
                    <h2>Send Us a Message</h2>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Full Name</label>
                            <input type="text" id="name" name="name" required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email Address</label>
                            <input type="email" id="email" name="email" required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="phone">Phone Number</label>
                            <input type="tel" id="phone" name="phone" />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="message">Your Message</label>
                            <textarea id="message" name="message" rows="6" required></textarea>
                        </div>
                        <button type="submit" className={styles.submitButton}>Send Message</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;