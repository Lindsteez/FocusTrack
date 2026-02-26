import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../hooks/useLanguage"
import styles from "./ToDo.module.css";
import Card from "../Card";
import Button from "../Button";

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function ToDo() {
      const { t } = useLanguage();
  const [text, setText] = useState("");

  const [todos, setTodos] = useState(() => {
    try {
      const raw = localStorage.getItem("todos_v1");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("todos_v1", JSON.stringify(todos));
    } catch {
        //localStorage may be unavailable
    }
  }, [todos]);

  function addTodo() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTodos((prev) => [{ id: makeId(), text: trimmed, done: false }, ...prev]);
    setText("");
  }

  function toggleTodo(id) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function removeTodo(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.done));
  }

  const stats = useMemo(() => {
    const total = todos.length;
    const done = todos.filter((t) => t.done).length;
    return { total, done, left: total - done };
  }, [todos]);

  return (
    <div className={styles.page}>
      <Card title={`${t('todo.title')} (${stats.left} ${t('todo.left')})`}>
        <div className={styles.toolbar}>
          <input
            className={styles.input}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('todo.addTask')}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTodo();
            }}
          />

          <div className={styles.actions}>
            <Button
              label={t('todo.add')}
              variant="start"
              onClick={addTodo}
              disabled={!text.trim()}
              className={styles.addBtn}
            />
            <Button
              label={t('todo.clear')}
              variant="stop"
              onClick={clearCompleted}
              disabled={stats.done === 0}
              className={styles.clearBtn}
            />
          </div>
        </div>

        <div className={styles.list}>
          {todos.length === 0 ? (
            <div className={styles.empty}>No tasks yet.</div>
          ) : (
            todos.map((t) => (
              <div key={t.id} className={styles.row}>
                <input
                  className={styles.checkbox}
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggleTodo(t.id)}
                />

                <div className={`${styles.text} ${t.done ? styles.done : ""}`} title={t.text}>
                  {t.text}
                </div>

                <button
                  className={styles.deleteBtn}
                  onClick={() => removeTodo(t.id)}
                  aria-label="Delete task"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
