
import styles from './Button.module.css'

function Button({label, variant, onClick, disabled}) {
    return <button className={`${styles.btnBase} ${styles[variant]}`} onClick={onClick} disabled={disabled} type="button">
        {label}
    
    </button>;
}

export default Button;