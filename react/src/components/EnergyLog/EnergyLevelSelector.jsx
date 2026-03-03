import RateEnergy from "./EnergyBtn";
import styles from "./EnergyBtn.module.css";
import { useLanguage } from "../../hooks/useLanguage";

export default function EnergyLevelSelector({ value, onChange }) {
  const { t } = useLanguage();
  return (
    <div>
      <h2>{t('timer.energyTitle')}</h2>

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
