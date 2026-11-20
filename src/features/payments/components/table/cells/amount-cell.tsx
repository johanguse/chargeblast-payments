import { formatMoney } from "../../../domain/format";
import type { Payment } from "../../../domain/payment";

export function AmountCell({ payment }: { payment: Payment }) {
  return (
    <>
      <span className="amount-value">{formatMoney(payment)}</span>
      <span className="currency">{payment.currency}</span>
    </>
  );
}
