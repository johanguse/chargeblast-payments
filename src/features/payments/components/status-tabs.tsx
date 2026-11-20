import type { RefObject } from "react";
import type { PaymentStatus } from "../domain/payment";

const tabs: ("All" | PaymentStatus)[] = [
  "All",
  "Succeeded",
  "Refunded",
  "Disputed",
  "Failed",
  "Uncaptured",
];

export function StatusTabs({
  selected,
  onSelect,
  ref,
}: {
  selected: string[];
  onSelect: (status: string) => void;
  ref?: RefObject<HTMLDivElement | null>;
}) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: a <fieldset> adds a border and legend semantics this button row doesn't need.
    <div
      ref={ref}
      className="status-cards"
      id="payments"
      role="group"
      aria-label="Payment status"
      tabIndex={-1}
    >
      {tabs.map((v) => (
        <button
          type="button"
          key={v}
          aria-pressed={
            v === "All"
              ? !selected.length
              : selected.length === 1 && selected[0] === v
          }
          onClick={() => onSelect(v)}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
