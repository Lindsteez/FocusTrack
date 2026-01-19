import Logo from '../assets/svg/focustrack-logo.svg';
import styles from './NavbarDesktop.module.css';

function NavbarDesktop() {
    return (
        <>
            <nav className={styles.navbar}>
            <img src={Logo} alt="FocusTrack Logo" />
                <a href="#">Dashboard</a>
                <a href="#">History</a>
                <a href="#">Stats</a>
                <a href="#">Settings</a>
            </nav>
        </>
    );
}
export default NavbarDesktop;