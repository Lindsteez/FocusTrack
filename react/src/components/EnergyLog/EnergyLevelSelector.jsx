import RateEnergy from "./EnergyBtn";
import styles from "./EnergyBtn.module.css";

export default function EnergyLevelSelector({ value, onChange }) {
  return (
    <div>
      <p>Energy level</p>

      <div className={styles.buttons}>
        {[1, 2, 3, 4, 5].map((n) => (
          <RateEnergy
            key={n}
            rateEnergy={n}
            isActive={value === n}
            onClick={() => onChange(n)}
          />
        ))}
      </div>
    </div>
  );
}
