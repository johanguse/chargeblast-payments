import { Check, CircleAlert, CircleMinus, Clock, Undo2, X } from "lucide-react";
import type { PaymentStatus } from "../../../domain/payment";

const statusIcons: Record<PaymentStatus, typeof Check> = {
  Succeeded: Check,
  Failed: X,
  Canceled: X,
  Refunded: Undo2,
  Pending: Clock,
  Uncaptured: Clock,
  Disputed: CircleAlert,
  Blocked: CircleMinus,
};

export function StatusBadge({
  status,
  withIcon = true,
}: {
  status: PaymentStatus;
  withIcon?: boolean;
}) {
  const Icon = statusIcons[status];
  return (
    <span className={`badge ${status}`}>
      {status}
      {withIcon && (
        <Icon width={14} height={14} strokeWidth={2.3} aria-hidden="true" />
      )}
    </span>
  );
}
