import { pageSizes } from "../domain/query";

export function Pagination({
  total,
  start,
  end,
  page,
  pages,
  size,
  hidden,
  onPageChange,
  onSizeChange,
}: {
  total: number;
  start: number;
  end: number;
  page: number;
  pages: number;
  size: number;
  hidden?: boolean;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
}) {
  return (
    <footer
      className="pagination"
      style={hidden ? { visibility: "hidden" } : undefined}
    >
      <div className="result-range" aria-live="polite">
        Viewing{" "}
        {total ? (
          <>
            {start + 1}–{end} of <strong>{total}</strong> results
          </>
        ) : (
          "0 results"
        )}
      </div>
      <select
        aria-label="Rows per page"
        value={size}
        onChange={(event) => onSizeChange(Number(event.currentTarget.value))}
      >
        {pageSizes.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <nav aria-label="Pagination">
        <button
          type="button"
          disabled={page === 1}
          aria-label="Previous page"
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page === pages}
          aria-label="Next page"
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </nav>
    </footer>
  );
}
