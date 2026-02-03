import styles from './EnergyBtn.module.css'

function RateEnergy({ rateEnergy, onClick, isActive }) {
  return (
    <button
        type='button'
        onClick={onClick}
        className={`${styles.btnBase} ${isActive ? styles.active : ""}`}>
        {rateEnergy}
    </button>
  )
}

export default RateEnergy;