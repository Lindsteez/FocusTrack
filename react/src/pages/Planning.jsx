import { useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import { useLanguage } from "../hooks/useLanguage";
import {
  addPlanningItem,
  getDateKey,
  getPlanningItemsByDate,
  removePlanningItem,
  swapPlanningItemTimes,
  subscribePlanning,
  togglePlanningItemCompleted,
  updatePlanningItem,
} from "../utils/planningStore";
import styles from "./Planning.module.css";

const DAY_MS = 24 * 60 * 60 * 1000;

function getDateByOffset(dayOffset) {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  return new Date(base.getTime() + dayOffset * DAY_MS);
}

function formatDateParts(date, localeTag) {
  const weekday = new Intl.DateTimeFormat(localeTag, {
    weekday: "long",
  }).format(date);

  const dateLabel = new Intl.DateTimeFormat(localeTag, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);

  return { weekday, date: dateLabel };
}

export default function Planning() {
  const { t, locale } = useLanguage();
  const [dayOffset, setDayOffset] = useState(0);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState("default");
  const [editingItemId, setEditingItemId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [draggingItemId, setDraggingItemId] = useState(null);
  const [dropTargetItemId, setDropTargetItemId] = useState(null);
  const [items, setItems] = useState([]);

  const localeTag = locale === "sv" ? "sv-SE" : "en-US";
  const labels =
    locale === "sv"
      ? {
          today: "Idag",
          prev: "Föregående dag",
          next: "Nästa dag",
          title: "Aktivitet",
          titlePh: "t.ex. Cleaning",
          from: "Från",
          to: "Till",
          add: "Lägg till",
          edit: "Redigera",
          saveEdit: "Spara",
          cancelEdit: "Avbryt",
          filterAll: "Alla",
          filterPending: "Kvar",
          filterDone: "Klara",
          noPlan: "Inga planerade aktiviteter för den här dagen ännu.",
          noMatch: "Inga aktiviteter matchar filtret.",
          dragHint: "Dra ett kort till ett annat för att byta tider mellan aktiviteter.",
          markDone: "Klar",
          markUndone: "Ångra",
          delete: "Ta bort",
          done: "Klar",
          errTitle: "Skriv en aktivitetstitel.",
          errTime: "Tidsformat är ogiltigt.",
          errRange: "Sluttid måste vara efter starttid.",
          errPast: "Du kan inte lägga till en aktivitet i det förflutna i dag.",
          errOverlap: "Tiden överlappar med en annan aktivitet.",
          errNotFound: "Aktiviteten hittades inte.",
          errNoSlot: "Aktiviteterna kunde inte byta tid.",
          moved: "Aktiviteter bytte tid.",
          savedAdd: "Aktivitet tillagd.",
          savedEdit: "Aktivitet uppdaterad.",
        }
      : {
          today: "Today",
          prev: "Previous day",
          next: "Next day",
          title: "Activity",
          titlePh: "e.g. Cleaning",
          from: "From",
          to: "To",
          add: "Add",
          edit: "Edit",
          saveEdit: "Save",
          cancelEdit: "Cancel",
          filterAll: "All",
          filterPending: "Pending",
          filterDone: "Done",
          noPlan: "No planned activities for this day yet.",
          noMatch: "No activities match this filter.",
          dragHint: "Drag one card onto another to swap their times.",
          markDone: "Done",
          markUndone: "Undo",
          delete: "Delete",
          done: "Done",
          errTitle: "Please enter an activity title.",
          errTime: "Invalid time format.",
          errRange: "End time must be after start time.",
          errPast: "You cannot add an activity in the past for today.",
          errOverlap: "This time overlaps with another activity.",
          errNotFound: "Activity not found.",
          errNoSlot: "Activities could not swap time.",
          moved: "Activities swapped time.",
          savedAdd: "Activity added.",
          savedEdit: "Activity updated.",
        };

  const targetDate = useMemo(() => getDateByOffset(dayOffset), [dayOffset]);
  const targetDateKey = useMemo(() => getDateKey(targetDate), [targetDate]);
  const isEditing = Boolean(editingItemId);
  const filteredItems = useMemo(() => {
    if (statusFilter === "done") return items.filter((item) => item.completed);
    if (statusFilter === "pending") return items.filter((item) => !item.completed);
    return items;
  }, [items, statusFilter]);
  const dayText = useMemo(
    () => formatDateParts(targetDate, localeTag),
    [targetDate, localeTag],
  );

  useEffect(() => {
    function sync() {
      setItems(getPlanningItemsByDate(targetDateKey));
    }

    sync();
    return subscribePlanning(sync);
  }, [targetDateKey]);

  function resetForm() {
    setEditingItemId(null);
    setTitle("");
    setStartTime("09:00");
    setEndTime("09:30");
  }

  function clearMessage() {
    setMessage("");
    setMessageTone("default");
  }

  function showMessage(text, tone = "default") {
    setMessage(text);
    setMessageTone(tone);
  }

  function handleCancelEdit() {
    resetForm();
    clearMessage();
    setDraggingItemId(null);
    setDropTargetItemId(null);
  }

  function handleStartEdit(item) {
    setEditingItemId(item.id);
    setTitle(item.title);
    setStartTime(item.startTime);
    setEndTime(item.endTime);
    clearMessage();
    setDraggingItemId(null);
    setDropTargetItemId(null);
  }

  function handleChangeDay(delta) {
    resetForm();
    clearMessage();
    setDraggingItemId(null);
    setDropTargetItemId(null);
    setDayOffset((prev) => prev + delta);
  }

  function handleGoToday() {
    resetForm();
    clearMessage();
    setDraggingItemId(null);
    setDropTargetItemId(null);
    setDayOffset(0);
  }

  function handleSubmitForm() {
    const result = isEditing
      ? updatePlanningItem({
          id: editingItemId,
          title,
          startTime,
          endTime,
        })
      : addPlanningItem({
          dateKey: targetDateKey,
          title,
          startTime,
          endTime,
        });

    if (!result.ok) {
      if (result.reason === "not-found" || result.reason === "invalid-id") {
        showMessage(labels.errNotFound);
        return;
      }
      if (result.reason === "title-required") {
        showMessage(labels.errTitle);
        return;
      }
      if (result.reason === "invalid-time") {
        showMessage(labels.errTime);
        return;
      }
      if (result.reason === "invalid-range") {
        showMessage(labels.errRange);
        return;
      }
      if (result.reason === "past-time") {
        showMessage(labels.errPast, "calm");
        return;
      }
      if (result.reason === "overlap") {
        showMessage(labels.errOverlap);
        return;
      }

      showMessage(labels.errRange);
      return;
    }

    if (isEditing) {
      resetForm();
      showMessage(labels.savedEdit);
      return;
    }

    setTitle("");
    showMessage(labels.savedAdd);
  }

  function handleDragStart(event, itemId) {
    if (editingItemId === itemId) {
      event.preventDefault();
      return;
    }
    setDraggingItemId(itemId);
    setDropTargetItemId(null);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", itemId);
  }

  function handleDragEnd() {
    setDraggingItemId(null);
    setDropTargetItemId(null);
  }

  function handleDragOverItem(event, targetId) {
    if (!draggingItemId || draggingItemId === targetId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (dropTargetItemId !== targetId) {
      setDropTargetItemId(targetId);
    }
  }

  function handleDropOnItem(event, targetId) {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData("text/plain") || draggingItemId;
    if (!sourceId || sourceId === targetId) return;

    const movingItem = items.find((item) => item.id === sourceId);
    const targetItem = items.find((item) => item.id === targetId);
    if (!movingItem || !targetItem) {
      setDraggingItemId(null);
      setDropTargetItemId(null);
      return;
    }

    setDraggingItemId(null);
    setDropTargetItemId(null);

    const swapResult = swapPlanningItemTimes(movingItem.id, targetItem.id);
    if (!swapResult.ok) {
      showMessage(labels.errNoSlot);
      return;
    }

    showMessage(labels.moved);
  }

  return (
    <section className={styles.planning}>
      <div className={styles.planningPanel}>
        <Card title={t("nav.planning")}>
          <div className={styles.dayRow}>
            <button
              type="button"
              className={styles.dayBtn}
              onClick={() => handleChangeDay(-1)}
              aria-label={labels.prev}
              title={labels.prev}
            >
              ‹
            </button>

            <div className={styles.dayInfo}>
              <p className={styles.weekday}>{dayText.weekday}</p>
              <p className={styles.date}>{dayText.date}</p>
            </div>

            <button
              type="button"
              className={styles.dayBtn}
              onClick={() => handleChangeDay(1)}
              aria-label={labels.next}
              title={labels.next}
            >
              ›
            </button>

            <button
              type="button"
              className={styles.todayBtn}
              onClick={handleGoToday}
              disabled={dayOffset === 0}
            >
              {labels.today}
            </button>
          </div>

          <div className={styles.filtersRow}>
            <button
              type="button"
              className={`${styles.filterBtn} ${statusFilter === "all" ? styles.filterBtnActive : ""}`}
              onClick={() => setStatusFilter("all")}
              aria-pressed={statusFilter === "all"}
            >
              {labels.filterAll}
            </button>
            <button
              type="button"
              className={`${styles.filterBtn} ${statusFilter === "pending" ? styles.filterBtnActive : ""}`}
              onClick={() => setStatusFilter("pending")}
              aria-pressed={statusFilter === "pending"}
            >
              {labels.filterPending}
            </button>
            <button
              type="button"
              className={`${styles.filterBtn} ${statusFilter === "done" ? styles.filterBtnActive : ""}`}
              onClick={() => setStatusFilter("done")}
              aria-pressed={statusFilter === "done"}
            >
              {labels.filterDone}
            </button>
          </div>

          <p className={styles.dragHint}>{labels.dragHint}</p>

          <div className={`${styles.formGrid} ${isEditing ? styles.formGridEditing : ""}`}>
            <label className={styles.field}>
              <span>{labels.title}</span>
              <input
                className={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={labels.titlePh}
              />
            </label>

            <label className={styles.field}>
              <span>{labels.from}</span>
              <input
                type="time"
                className={styles.input}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span>{labels.to}</span>
              <input
                type="time"
                className={styles.input}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </label>

            <button
              type="button"
              className={styles.addBtn}
              onClick={handleSubmitForm}
            >
              {isEditing ? labels.saveEdit : labels.add}
            </button>

            {isEditing ? (
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={handleCancelEdit}
              >
                {labels.cancelEdit}
              </button>
            ) : null}
          </div>

          {message ? (
            <p
              className={`${styles.message} ${messageTone === "calm" ? styles.messageCalm : ""}`}
            >
              {message}
            </p>
          ) : null}

          <div className={styles.listViewport}>
            {filteredItems.length === 0 ? (
              <p className={styles.emptyText}>
                {items.length === 0 ? labels.noPlan : labels.noMatch}
              </p>
            ) : (
              <ul className={styles.list}>
                {filteredItems.map((item) => (
                  <li
                    key={item.id}
                    className={`${styles.item} ${item.completed ? styles.itemDone : ""} ${editingItemId === item.id ? styles.itemEditing : ""} ${draggingItemId === item.id ? styles.itemDragging : ""} ${dropTargetItemId === item.id ? styles.itemDropTarget : ""} ${editingItemId !== item.id ? styles.itemDraggable : ""}`}
                    draggable={editingItemId !== item.id}
                    onDragStart={(event) => handleDragStart(event, item.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(event) => handleDragOverItem(event, item.id)}
                    onDrop={(event) => handleDropOnItem(event, item.id)}
                  >
                    <div className={styles.itemMain}>
                      <button
                        type="button"
                        className={`${styles.itemCheck} ${item.completed ? styles.itemCheckDone : ""}`}
                        onClick={() => togglePlanningItemCompleted(item.id)}
                        aria-label={item.completed ? labels.markUndone : labels.markDone}
                        title={item.completed ? labels.markUndone : labels.markDone}
                      >
                        {item.completed ? "✓" : "○"}
                      </button>

                      <div className={styles.itemMeta}>
                        <span
                          className={`${styles.itemTime} ${item.completed ? styles.itemTextDone : ""}`}
                        >
                          {item.startTime}-{item.endTime}
                        </span>
                        <span
                          className={`${styles.itemTitle} ${item.completed ? styles.itemTextDone : ""}`}
                        >
                          {item.title}
                        </span>
                      </div>
                    </div>

                    <div className={styles.itemActions}>
                      <button
                        type="button"
                        className={`${styles.editBtn} ${editingItemId === item.id ? styles.editBtnActive : ""}`}
                        onClick={() => handleStartEdit(item)}
                      >
                        {labels.edit}
                      </button>

                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => removePlanningItem(item.id)}
                      >
                        {labels.delete}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}
