import { ChartColumn, Plus } from "lucide-react";

const tabs = [
  "Payouts",
  "Top-ups",
  "Collected fees",
  "Transfers",
  "All activity",
];

export function PageHeading({ onAnalyze }: { onAnalyze: () => void }) {
  return (
    <>
      <div className="heading">
        <h1>Transactions</h1>
        <div>
          <button type="button" className="outline create-payment">
            <Plus /> Create payment
          </button>
          <button type="button" className="outline" onClick={onAnalyze}>
            <ChartColumn /> Analyze
          </button>
        </div>
      </div>
      {/* Scrolls sideways on small screens, so it must be focusable (axe scrollable-region-focusable). */}
      {/* biome-ignore lint/a11y/useSemanticElements: a <section> would pick up the page's section styles. */}
      <div
        className="tabs"
        role="region"
        aria-label="Transaction types"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: scroll containers must be keyboard-focusable.
        tabIndex={0}
      >
        <strong>Payments</strong>
        {tabs.map((tab) => (
          <span key={tab}>{tab}</span>
        ))}
      </div>
    </>
  );
}
