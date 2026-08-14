const STAT_CARDS = [
  { key: "total_tasks", label: "Total Tasks" },
  { key: "pending_tasks", label: "Pending" },
  { key: "completed_tasks", label: "Completed" },
  { key: "high_priority_tasks", label: "High Priority" },
];

export default function Statistics({ stats }) {
  return (
    <section className="stats">
      {STAT_CARDS.map((card) => (
        <div className="stat-card" key={card.key}>
          <span className="stat-value">{stats[card.key] ?? 0}</span>
          <span className="stat-label">{card.label}</span>
        </div>
      ))}
    </section>
  );
}