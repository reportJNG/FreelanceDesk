export function EmptyState({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="card state-card">
      <div>
        <h3 className="state-title">{title}</h3>
        {action ? <div className="section-gap">{action}</div> : null}
      </div>
    </div>
  );
}
