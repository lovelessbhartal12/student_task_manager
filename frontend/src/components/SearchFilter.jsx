const STATUS_OPTIONS = [
  { value: "all", label: "Status: All" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
];

const PRIORITY_OPTIONS = [
  { value: "all", label: "All Priorities" },
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];

export default function SearchFilter({
  query,
  onQueryChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
}) {
  return (
    <section className="search-filter">
      <input
        type="search"
        className="search-input"
        placeholder="Search tasks..."
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        aria-label="Search tasks"
      />
      <select
        className="filter-select"
        value={statusFilter}
        onChange={(event) => onStatusChange(event.target.value)}
        aria-label="Filter by status"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select
        className="filter-select"
        value={priorityFilter}
        onChange={(event) => onPriorityChange(event.target.value)}
        aria-label="Filter by priority"
      >
        {PRIORITY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </section>
  );
}