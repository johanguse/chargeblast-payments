import { Check } from "lucide-react";
import { Popover } from "@/components/ui/popover";
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
            <Popover
              label={`Rows per page: ${size}`}
              trigger={`${start + 1}–${end}`}
            >
              {(close) => (
                <>
                  <h2>Rows per page</h2>
                  {pageSizes.map((n) => (
                    <button
                      type="button"
                      className="size-option"
                      key={n}
                      aria-pressed={n === size}
                      onClick={() => {
                        onSizeChange(n);
                        close();
                      }}
                    >
                      {n} rows {n === size && <Check size={14} />}
                    </button>
                  ))}
                </>
              )}
            </Popover>{" "}
            of <strong>{total}</strong> results
          </>
        ) : (
          "0 results"
        )}
      </div>
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
