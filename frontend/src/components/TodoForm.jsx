import { useEffect, useState } from "react";

const PRIORITIES = ["Low", "Medium", "High"];
const EMPTY_FORM = { title: "", description: "", priority: "Medium", due_date: "" };

export default function TodoForm({ editingTodo, onCreate, onUpdate, onCancelEdit }) {
  const [title, setTitle] = useState(EMPTY_FORM.title);
  const [description, setDescription] = useState(EMPTY_FORM.description);
  const [priority, setPriority] = useState(EMPTY_FORM.priority);
  const [dueDate, setDueDate] = useState(EMPTY_FORM.due_date);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
      setDescription(editingTodo.description ?? "");
      setPriority(editingTodo.priority);
      setDueDate(editingTodo.due_date ?? "");
      setErrors({});
    } else {
      resetForm();
    }
  }, [editingTodo]);

  function validate() {
    const nextErrors = {};

    if (!title.trim()) {
      nextErrors.title = "Title is required.";
    } else if (title.trim().length > 200) {
      nextErrors.title = "Title must be 200 characters or fewer.";
    }

    if (description.trim().length > 2000) {
      nextErrors.description = "Description must be 2000 characters or fewer.";
    }

    if (dueDate && Number.isNaN(new Date(dueDate).getTime())) {
      nextErrors.due_date = "Please enter a valid date.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function resetForm() {
    setTitle(EMPTY_FORM.title);
    setDescription(EMPTY_FORM.description);
    setPriority(EMPTY_FORM.priority);
    setDueDate(EMPTY_FORM.due_date);
    setErrors({});
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    const todo = {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      due_date: dueDate || null,
    };

    const saved = editingTodo
      ? await onUpdate(editingTodo.id, todo)
      : await onCreate(todo);

    if (saved && !editingTodo) {
      resetForm();
    }
  }

  function handleCancelEdit() {
    resetForm();
    onCancelEdit();
  }

  return (
    <section className="form-card">
      <h2 className="section-title">{editingTodo ? "Edit Task" : "Add a task"}</h2>

      <form className="todo-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group form-group-full">
          <label htmlFor="todo-title">Task Title</label>
          <input
            id="todo-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What needs to be done?"
            maxLength={200}
          />
          {errors.title && <span className="form-error">{errors.title}</span>}
        </div>

        <div className="form-group form-group-full">
          <label htmlFor="todo-description">Description</label>
          <textarea
            id="todo-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Add some details..."
            rows={3}
            maxLength={2000}
          />
          {errors.description && (
            <span className="form-error">{errors.description}</span>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="todo-priority">Priority</label>
            <select
              id="todo-priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              {PRIORITIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="todo-due-date">Due Date</label>
            <input
              id="todo-due-date"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
            {errors.due_date && <span className="form-error">{errors.due_date}</span>}
          </div>
        </div>

        <div className="form-actions">
          {editingTodo && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          )}
          <button type="submit" className="btn">
            {editingTodo ? "Save" : "+ Add Todo"}
          </button>
        </div>
      </form>
    </section>
  );
}