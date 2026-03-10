import styles from "./Button.module.css";

function Button({
  label,
  variant = "start",
  onClick,
  disabled,
  className = "",
}) {
  const btnClass = `${styles.btnBase} ${styles[variant] || ""} ${className}`.trim();

  return (
    <button
      className={btnClass}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {label}
    </button>
  );
}

export default Button;
