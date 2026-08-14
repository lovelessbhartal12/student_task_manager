function formatDate(dateString) {
  if (!dateString) {
    return "";
  }
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isOverdue(todo) {
  if (!todo.due_date || todo.completed) {
    return false;
  }
  const due = new Date(`${todo.due_date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

export default function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const completed = todo.completed;
  const overdue = isOverdue(todo);

  return (
    <li className={`todo-card ${completed ? "todo-card-completed" : ""}`}>
      <div className="todo-card-header">
        <h3 className={`todo-title ${completed ? "todo-title-completed" : ""}`}>
          {todo.title}
        </h3>
        <div className="todo-badges">
          {overdue && <span className="badge badge-overdue">OVERDUE</span>}
          {completed ? (
            <span className="badge badge-done">DONE</span>
          ) : (
            <span className={`badge priority-${todo.priority.toLowerCase()}`}>
              {todo.priority.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {todo.description && (
        <p className="todo-description">{todo.description}</p>
      )}

      <div className="todo-meta">
        <span className="todo-meta-item">
          Due: {todo.due_date ? formatDate(todo.due_date) : "No due date"}
        </span>
        <span className="todo-meta-item">
          Created: {formatDate(todo.created_at)}
        </span>
      </div>

      <div className="todo-actions">
        <button className="btn btn-small" onClick={() => onToggle(todo)}>
          {completed ? "Mark Pending" : "Complete"}
        </button>
        <button className="btn btn-small btn-outline" onClick={() => onEdit(todo)}>
          Edit
        </button>
        <button
          className="btn btn-small btn-outline-danger"
          onClick={() => onDelete(todo)}
        >
          Delete
        </button>
      </div>
    </li>
  );
}