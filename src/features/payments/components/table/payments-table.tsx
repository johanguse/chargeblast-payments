import * as Tooltip from "@radix-ui/react-tooltip";
import { useMemo, useState } from "react";
import {
  ACTIONS_COLUMN_WIDTH,
  type Column,
  SELECT_COLUMN_WIDTH,
} from "../../domain/columns";
import { compactDateFormatter } from "../../domain/format";
import { isSelectable, type Payment } from "../../domain/payment";
import { readSort } from "../../domain/query";
import { paymentDetailsHref } from "../../domain/routes";
import { useTimeZone } from "../../hooks/use-time-zone";
import { ColumnHeader } from "./column-header";
import { PaymentRow } from "./payment-row";
import { TableSkeletonRows } from "./table-skeleton";

type Props = {
  loading: boolean;
  pageSize: number;
  rows: Payment[];
  columns: Column[];
  widths: Record<Column, number>;
  wrap: boolean;
  params: URLSearchParams;
  now: number;
  onSort: (column: Column) => void;
  onResize: (column: Column, width: number) => void;
  onMove: (column: Column, target: Column) => void;
  announce: (message: string) => void;
};

export function PaymentsTable({
  loading,
  pageSize,
  rows,
  columns,
  widths,
  wrap,
  params,
  now,
  onSort,
  onResize,
  onMove,
  announce,
}: Props) {
  const zone = useTimeZone();
  const formatDate = useMemo(() => compactDateFormatter(zone), [zone]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dragging, setDragging] = useState<Column | null>(null);
  const sort = readSort(params);

  const selectable = rows.filter(isSelectable);
  const allSelected =
    selectable.length > 0 && selectable.every((p) => selected.has(p.id));

  function select(ids: string[], checked: boolean) {
    setSelected((old) => {
      const next = new Set(old);
      for (const id of ids) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  async function copyId(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      announce("Payment ID copied");
    } catch {
      announce("Clipboard unavailable");
    }
  }

  const tableWidth =
    SELECT_COLUMN_WIDTH +
    ACTIONS_COLUMN_WIDTH +
    columns.reduce((sum, c) => sum + widths[c], 0);

  return (
    <Tooltip.Provider delayDuration={300}>
      {/* Scroll container: focusable so keyboard users can scroll it (axe scrollable-region-focusable). */}
      {/* biome-ignore lint/a11y/useSemanticElements: a <section> would pick up the page's section styles. */}
      <div
        className={`gridscroll${wrap ? " wrap-cells" : ""}`}
        role="region"
        aria-busy={loading}
        aria-label="Payments table"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: scroll containers must be keyboard-focusable.
        tabIndex={0}
      >
        <table style={{ width: tableWidth }}>
          <caption className="sr">
            Payments. Open an amount to view payment details.
          </caption>
          <colgroup>
            <col style={{ width: SELECT_COLUMN_WIDTH }} />
            {columns.map((c) => (
              <col key={c} style={{ width: widths[c] }} />
            ))}
            <col style={{ width: ACTIONS_COLUMN_WIDTH }} />
          </colgroup>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  aria-label="Select all payments on this page"
                  checked={allSelected}
                  disabled={loading || !selectable.length}
                  onChange={(e) =>
                    select(
                      selectable.map((p) => p.id),
                      e.target.checked,
                    )
                  }
                />
              </th>
              {columns.map((c) => (
                <ColumnHeader
                  key={c}
                  column={c}
                  width={widths[c]}
                  sort={sort}
                  onSort={onSort}
                  onResize={onResize}
                  onDragStart={setDragging}
                  onDrop={(target) => {
                    if (dragging) onMove(dragging, target);
                    setDragging(null);
                  }}
                />
              ))}
              <th className="action-cell">
                <span className="sr">Actions</span>
              </th>
            </tr>
          </thead>
          {loading ? (
            <TableSkeletonRows
              count={pageSize}
              columnCount={columns.length + 2}
            />
          ) : (
            <tbody>
              {rows.map((p) => (
                <PaymentRow
                  key={p.id}
                  payment={p}
                  columns={columns}
                  href={paymentDetailsHref(p.id, {
                    at: now,
                    timeZone: zone,
                    listParams: params,
                  })}
                  now={now}
                  formatDate={formatDate}
                  selected={selected.has(p.id)}
                  onSelect={(checked) => select([p.id], checked)}
                  onCopyId={copyId}
                />
              ))}
            </tbody>
          )}
        </table>
      </div>
    </Tooltip.Provider>
  );
}
