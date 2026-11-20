import Link from "next/link";
import { AnalyzeIcon, PlusIcon } from "@/components/icons/ui-icons";

export const transactionTabs = [
  "Payments",
  "Payouts",
  "Top-ups",
  "Collected fees",
  "Transfers",
  "All activity",
] as const;
export type TransactionTab = (typeof transactionTabs)[number];

export function tabSlug(tab: TransactionTab) {
  return tab.toLowerCase().replaceAll(" ", "-");
}

export function PageHeading({
  activeTab,
  onAnalyze,
}: {
  activeTab: TransactionTab;
  onAnalyze: () => void;
}) {
  return (
    <>
      <div className="heading">
        <h1>Transactions</h1>
        <div>
          <button type="button" className="outline create-payment">
            <PlusIcon /> Create payment
          </button>
          <button type="button" className="outline" onClick={onAnalyze}>
            <AnalyzeIcon /> Analyze
          </button>
        </div>
      </div>
      <nav className="tabs" aria-label="Transaction types">
        {transactionTabs.map((tab) => (
          <Link
            key={tab}
            href={
              tab === "Payments"
                ? "/payments"
                : `/payments?view=${tabSlug(tab)}`
            }
            aria-current={tab === activeTab ? "page" : undefined}
          >
            {tab}
          </Link>
        ))}
      </nav>
    </>
  );
}
