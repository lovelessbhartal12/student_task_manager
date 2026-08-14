import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Statistics from "./components/Statistics";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import SearchFilter from "./components/SearchFilter";
import Notification from "./components/Notification";
import * as api from "./api";

const EMPTY_STATS = {
  total_tasks: 0,
  pending_tasks: 0,
  completed_tasks: 0,
  high_priority_tasks: 0,
};

export default function App() {
  const [todos, setTodos] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [editingTodo, setEditingTodo] = useState(null);
  const [todoToDelete, setTodoToDelete] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!notification) {
      return undefined;
    }
    const timer = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  useEffect(() => {
    loadData();
  }, []);

  function notify(message, type = "success") {
    setNotification({ message, type });
  }

  async function loadData() {
    try {
      const [todoData, statsData] = await Promise.all([api.getTodos(), api.getStats()]);
      setTodos(todoData);
      setStats(statsData);
      return true;
    } catch (error) {
      notify(error.message || "Failed to load todos", "error");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(todo) {
    try {
      await api.createTodo(todo);
      await loadData();
      notify("Todo created successfully");
      return true;
    } catch (error) {
      notify(error.message, "error");
      return false;
    }
  }

  async function handleUpdate(id, todo) {
    try {
      await api.updateTodo(id, todo);
      await loadData();
      setEditingTodo(null);
      notify("Todo updated successfully");
      return true;
    } catch (error) {
      notify(error.message, "error");
      return false;
    }
  }

  async function handleToggle(todo) {
    try {
      await api.toggleTodo(todo.id);
      await loadData();
      notify(todo.completed ? "Todo marked pending" : "Todo completed");
    } catch (error) {
      notify(error.message, "error");
    }
  }

  async function handleDelete(todo) {
    try {
      await api.deleteTodo(todo.id);
      setTodoToDelete(null);
      await loadData();
      notify("Todo deleted successfully");
    } catch (error) {
      setTodoToDelete(null);
      notify(error.message, "error");
    }
  }

  function handleEdit(todo) {
    setEditingTodo(todo);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const filteredTodos = useMemo(() => {
    const search = query.trim().toLowerCase();
    return todos.filter((todo) => {
      const matchesSearch =
        !search ||
        todo.title.toLowerCase().includes(search) ||
        (todo.description ?? "").toLowerCase().includes(search);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "completed") === todo.completed;
      const matchesPriority =
        priorityFilter === "all" || todo.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [todos, query, statusFilter, priorityFilter]);

  return (
    <div className="app">
      <Notification notification={notification} />
      <Header />

      <main className="container">
        <Statistics stats={stats} />
        <TodoForm
          editingTodo={editingTodo}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onCancelEdit={() => setEditingTodo(null)}
        />

        <SearchFilter
          query={query}
          onQueryChange={setQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
        />

        <section className="tasks-section">
          <h2 className="section-title">Tasks</h2>
          {todos.length > 0 && filteredTodos.length === 0 ? (
            <div className="empty-state">
              <p className="empty-subtitle">No tasks match your search or filters.</p>
            </div>
          ) : (
            <TodoList
              todos={filteredTodos}
              loading={loading}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={setTodoToDelete}
            />
          )}
        </section>
      </main>

      {todoToDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <p className="modal-message">
              Are you sure you want to delete this task?
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setTodoToDelete(null)}
              >
                Cancel
              </button>
              <button className="btn" onClick={() => handleDelete(todoToDelete)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}