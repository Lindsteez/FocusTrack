import StatsSummary from "../components/StatsSummary";
import styles from "../pages/Stats.module.css";

export default function Stats() {
  return (
    <section className={styles.stats}>
      <StatsSummary />
    </section>
  );
}
