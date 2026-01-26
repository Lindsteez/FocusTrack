import { NavLink } from 'react-router-dom';
import Logo from '../../assets/svg/focustrack-logo.svg';
import styles from './NavbarDesktop.module.css';

function NavbarDesktop() {
    return (
        <>
            <nav className={styles.navbar}>
            <img src={Logo} alt="FocusTrack Logo" />
                <a href="/">Dashboard</a>
                <a href="/history">History</a>
                <a href="/stats">Stats</a>
                <a href="/settings">Settings</a>
            </nav>
        </>
    );
}
export default NavbarDesktop;