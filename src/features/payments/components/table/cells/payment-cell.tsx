import type { Column } from "../../../domain/columns";
import type { Payment } from "../../../domain/payment";
import { AmountCell } from "./amount-cell";
import { PaymentMethodCell } from "./payment-method-cell";
import { StatusBadge } from "./status-badge";

const EMPTY = "—";

/**
 * Content of a plain table cell. Date and Payment ID are interactive on their
 * own and are rendered by PaymentRow instead.
 */
export function PaymentCell({
  column,
  payment: p,
  formatDate,
}: {
  column: Column;
  payment: Payment;
  formatDate: Intl.DateTimeFormat;
}) {
  switch (column) {
    case "Amount":
      return <AmountCell payment={p} />;
    case "Status":
      return <StatusBadge status={p.status} />;
    case "Payment method":
      return (
        <PaymentMethodCell brand={p.brand} wallet={p.wallet} last4={p.last4} />
      );
    case "Description":
      return p.description;
    case "Customer":
    case "Billing email":
      return p.email;
    case "Customer name":
      return p.name;
    case "Wallet":
      return p.wallet;
    case "Refunded date":
      return p.refundedAt ? formatDate.format(p.refundedAt) : EMPTY;
    case "Decline reason":
      return p.declineReason || EMPTY;
    default:
      return EMPTY;
  }
}
