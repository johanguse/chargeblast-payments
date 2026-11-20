export function Fields({ rows }: { rows: Record<string, string> }) {
  return (
    <dl className="payment-fields">
      {Object.entries(rows).map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
