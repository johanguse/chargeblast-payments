export function TableSkeletonRows({
  count,
  columnCount,
}: {
  count: number;
  columnCount: number;
}) {
  return (
    <tbody className="skeleton-table" aria-hidden="true">
      {/* Placeholder rows have no identity; their index is the key. */}
      {Array.from({ length: count }, (_, row) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
        <tr key={row}>
          {Array.from({ length: columnCount }, (_, column) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
            <td key={column}>
              <i />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
