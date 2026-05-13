export function ErrorState({ error }: { error: unknown }) {
  return <div className="card error-card">{error instanceof Error ? error.message : "Something went wrong"}</div>;
}
