export function ErrorState({ error }: { error: unknown }) {
  return (
    <div className="card error-card" role="alert">
      <strong>Something went wrong</strong>
      <p className="state-description">{error instanceof Error ? error.message : "Please refresh and try again."}</p>
    </div>
  );
}
