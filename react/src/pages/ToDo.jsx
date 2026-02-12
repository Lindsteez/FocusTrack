import ToDo from "../components/ToDo/ToDo";
import styles from "../pages/ToDo.module.css"

export default function ToDoPage() {
  return (
    <section className={styles.todo}>
      <ToDo />
    </section>
)
}
