import styles from './Footer.module.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className={styles.footer}>
            <p>&copy; {currentYear} Coventry Motors. All Rights Reserved.</p>
            <p>7 Bishop Street, Coventry, CV1 1HU | <a href="tel:02476000000">024 7600 0000</a></p>
        </footer>
    );
};

export default Footer;