import { NavLink } from 'react-router-dom'
import Logo from '../assets/svg/focustrack-logo.svg'
import styles from './NavbarDesktop.module.css'

function NavbarDesktop() {
  const linkClass = ({ isActive }) =>
    `${styles.link} ${isActive ? styles.active : ''}`

  return (
    <nav className={styles.navbar}>
      <img src={Logo} alt="FocusTrack Logo" />

      <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
      <NavLink to="/history" className={linkClass}>History</NavLink>
      <NavLink to="/stats" className={linkClass}>Stats</NavLink>
      <NavLink to="/settings" className={linkClass}>Settings</NavLink>
    </nav>
  )
}

export default NavbarDesktop