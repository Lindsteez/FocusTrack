import Logo from '../assets/svg/focustrack-logo.svg';
import styles from './LogoMobile.module.css';

function LogoImport() {
    console.log(Logo);
    return (

        <div className={styles.img}>
            <img src={Logo} alt="FocusTrack Logo" />
        </div>
    );
}

export default LogoImport;