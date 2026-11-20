import {
  Check,
  CircleMinus,
  Clock,
  type LucideIcon,
  Undo2,
  X,
} from "lucide-react";
import type { PaymentStatus } from "../../../domain/payment";

const statusIcons: Record<PaymentStatus, LucideIcon> = {
  Succeeded: Check,
  Failed: X,
  Canceled: X,
  Refunded: Undo2,
  Pending: Clock,
  Uncaptured: Clock,
  Disputed: CircleMinus,
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
      {withIcon && <Icon size={12} aria-hidden="true" />}
    </span>
  );
}
