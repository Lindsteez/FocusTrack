import styles from "./Card.module.css";

function Card({ title, children, className = "" }) {
  const cardClass = `${styles.card} card ${className}`.trim();

  return (
    <section className={cardClass}>
      {title ? (
        <header className={`${styles.header} cardHeader`}>
          <h3>{title}</h3>
        </header>
      ) : null}

      <div className={`${styles.content} content`}>{children}</div>
    </section>
  );
}

export default Card;
