import { NavLink } from 'react-router-dom'
import styles from './NavbarMobile.module.css'
import { useLanguage } from '../../pages/settings/languageContext/LanguageProvider'

function NavbarMobile() {
  const { t } = useLanguage();
  const linkClass = ({ isActive }) =>
    `${styles.navItem} ${isActive ? styles.active : ''}`

  return (
    <nav className={styles.navbar}>
      <NavLink to="/" className={linkClass} end>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="13" r="8" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="13" x2="15" y2="15" />
          <line x1="9" y1="2" x2="15" y2="2" />
        </svg>
        <span>{t('nav.dashboard')}</span>
      </NavLink>

      <NavLink to="/history" className={linkClass}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
        <span>{t('nav.history')}</span>
      </NavLink>

      <NavLink to="/todo" className={linkClass}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          
          <path d="M16 4h1a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1" />
          <rect x="8" y="2" width="8" height="4" rx="1" />
          
          <path d="M8 11l1.5 1.5L12 10" />
          <line x1="13" y1="11" x2="17" y2="11" />
          <path d="M8 16l1.5 1.5L12 15" />
          <line x1="13" y1="16" x2="17" y2="16" />
        </svg>
        <span>{t('nav.todo')}</span>
      </NavLink>


      <NavLink to="/stats" className={linkClass}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="20" x2="12" y2="10" />
          <line x1="18" y1="20" x2="18" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        <span>{t('nav.stats')}</span>
      </NavLink>

      <NavLink to="/settings" className={linkClass}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .66.39 1.26 1 1.51H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        <span>{t('nav.settings')}</span>
      </NavLink>
    </nav>
  )
}

export default NavbarMobile