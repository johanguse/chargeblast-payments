import Link from "next/link";
import type { Column } from "../../domain/columns";
import { isSelectable, type Payment } from "../../domain/payment";
import { CopyableId } from "./cells/copyable-id";
import { DateCell } from "./cells/date-cell";
import { PaymentCell } from "./cells/payment-cell";
import { RowActions } from "./row-actions";

export function PaymentRow({
  payment: p,
  columns,
  href,
  now,
  formatDate,
  selected,
  onSelect,
  onCopyId,
}: {
  payment: Payment;
  columns: Column[];
  href: string;
  now: number;
  formatDate: Intl.DateTimeFormat;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onCopyId: (id: string) => void;
}) {
  const selectable = isSelectable(p);
  return (
    <tr data-selectable={selectable} className={selected ? "selected" : ""}>
      <td>
        <input
          type="checkbox"
          checked={selected}
          disabled={!selectable}
          aria-label={`Select payment ${p.id}`}
          onChange={(e) => onSelect(e.target.checked)}
        />
      </td>
      {columns.map((c) => (
        <td key={c} className={c === "Amount" ? "numeric" : ""}>
          {c === "Payment ID" ? (
            <CopyableId id={p.id} onCopy={onCopyId} />
          ) : c === "Date" ? (
            <DateCell
              time={p.created}
              now={now}
              href={href}
              formatter={formatDate}
            />
          ) : (
            <Link
              className={`cell-link ${c === "Amount" ? "amount" : ""}`}
              href={href}
              tabIndex={c === "Amount" ? 0 : -1}
            >
              <PaymentCell column={c} payment={p} formatDate={formatDate} />
            </Link>
          )}
        </td>
      ))}
      <td className="action-cell">
        <RowActions
          id={p.id}
          href={href}
          showQuickActions={selectable}
          onCopyId={onCopyId}
        />
      </td>
    </tr>
  );
}
