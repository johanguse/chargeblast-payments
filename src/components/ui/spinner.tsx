export function Spinner({ label }: { label: string }) {
  return (
    <div className="loading-spinner" role="status">
      <span aria-hidden="true" />
      <span className="sr">{label}</span>
    </div>
  );
}
