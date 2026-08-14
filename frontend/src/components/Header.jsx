const API_DOCS_URL = import.meta.env.DEV
  ? "http://localhost:8000/docs"
  : "/docs";

export default function Header() {
  return (
    <header className="header">
      <div className="header-text">
        <h1 className="app-title">Todo App</h1>
        <p className="app-subtitle">Organize your tasks. Get things done.</p>
      </div>
      <a
        className="api-link"
        href={API_DOCS_URL}
        target="_blank"
        rel="noreferrer"
      >
        API Docs &rarr;
      </a>
    </header>
  );
}