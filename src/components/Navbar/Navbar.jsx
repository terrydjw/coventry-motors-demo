import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar = () => {
    return (
        <nav className={styles.navbar}>
            <NavLink to="/" className={styles.brand}>
                <h1>COVENTRY MOTORS</h1>
            </NavLink>
            <div className={styles.navLinks}>
                <NavLink to="/" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>Home</NavLink>
                <NavLink to="/services" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>Services</NavLink>
                <NavLink to="/about" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>About Us</NavLink>
                <NavLink to="/contact" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>Contact</NavLink>
            </div>
        </nav>
    );
};

export default Navbar;