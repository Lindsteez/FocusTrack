import StatsSummary from "../components/StatsSummary";
import GoalsProgressCard from "../components/GoalsProgressCard";
import styles from "../pages/Stats.module.css";

export default function Stats() {
  return (
    <section className={`${styles.stats} statsPage`}>
      <StatsSummary />
      <GoalsProgressCard />
    </section>
  );
}
