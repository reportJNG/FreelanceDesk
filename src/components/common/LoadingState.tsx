export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="card state-card" role="status" aria-live="polite">
      <div>
        <div className="spinner" aria-label={label} />
        <p className="state-description">{label}...</p>
      </div>
    </div>
  );
}
