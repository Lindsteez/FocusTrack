
import styles from './Button.module.css'

function Button({label, variant}) {
    return <button className={`${styles.btnBase} ${styles[variant]}`}>{label}</button>;
}

export default Button;