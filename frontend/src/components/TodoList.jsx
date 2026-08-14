import TodoItem from "./TodoItem";

export default function TodoList({ todos, loading, onToggle, onEdit, onDelete }) {
  if (loading) {
    return <p className="list-status">Loading tasks...</p>;
  }

  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-title">No tasks yet.</p>
        <p className="empty-subtitle">Create your first task to get started.</p>
      </div>
    );
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}