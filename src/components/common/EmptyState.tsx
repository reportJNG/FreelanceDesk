export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="card state-card">
      <div>
        <h3 className="state-title">{title}</h3>
        {description ? <p className="state-description">{description}</p> : null}
        {action ? <div className="section-gap">{action}</div> : null}
      </div>
    </div>
  );
}
