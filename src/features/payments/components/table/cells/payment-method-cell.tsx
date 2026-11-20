import {
  cardIcons,
  UnknownCardIcon,
  walletIcons,
} from "@/components/icons/payment-icons";
import type { Payment } from "../../../domain/payment";

export function PaymentMethodCell({
  brand,
  wallet,
  last4,
}: Pick<Payment, "brand" | "wallet" | "last4">) {
  const Card = cardIcons[brand] ?? UnknownCardIcon,
    WalletMark = walletIcons[wallet];
  const label = [
    WalletMark ? wallet : null,
    brand === "Bank" ? "ACH" : brand,
    `ending in ${last4}`,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <span className="instrument" title={label}>
      <span className="sr">{label}</span>
      <span>{WalletMark && <WalletMark />}</span>
      <Card />
      <span aria-hidden="true" className="digits">
        •••• {last4}
      </span>
    </span>
  );
}
