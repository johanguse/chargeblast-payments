import {
  Box,
  ChartColumn,
  ChevronDown,
  Clock3,
  CreditCard,
  Ellipsis,
  House,
  Layers2,
  ListFilter,
  Pin,
  Repeat2,
  UserRound,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { type WorkspaceProps, WorkspaceSwitcher } from "./workspace-switcher";

/** Static navigation copied from the Stripe dashboard; only Transactions is live. */
const groups = [
  {
    title: "",
    items: [
      ["Home", House],
      ["Balances", ListFilter],
      ["Transactions", Repeat2],
      ["Customers", UserRound],
      ["Product catalog", Box],
    ],
  },
  {
    title: "Shortcuts",
    items: ["Payments analytics", "Reports", "Sigma", "Radar"].map(
      (s) => [s, s === "Payments analytics" ? Pin : Clock3] as const,
    ),
  },
  {
    title: "Products",
    items: [
      ["Connect", Layers2],
      ["Payments", Wallet],
      ["Billing", CreditCard],
      ["Reporting", ChartColumn],
      ["More", Ellipsis],
    ],
  },
] as const;
const childrenByProduct: Record<string, string[]> = {
  Connect: ["Overview", "Connected accounts"],
  Payments: ["Transactions", "Disputes", "Payment links"],
  Billing: ["Overview", "Subscriptions", "Invoices"],
  Reporting: ["Reports", "Sigma"],
  More: ["Radar", "Tax"],
};
export function Sidebar({
  workspace,
  onSwitch,
  navigate,
}: WorkspaceProps & { navigate?: () => void }) {
  return (
    <div className="sidebar-content">
      <WorkspaceSwitcher workspace={workspace} onSwitch={onSwitch} />
      <nav aria-label="Main navigation">
        {groups.map((g) => (
          <section key={g.title}>
            {g.title && <small>{g.title}</small>}
            {g.items.map(([label, Icon]) =>
              label === "Transactions" ? (
                <Link
                  key={label}
                  href="/payments"
                  onClick={navigate}
                  aria-current="location"
                  className="navrow active"
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ) : g.title === "Products" ? (
                <details key={label} className="product-group">
                  <summary className="navrow">
                    <Icon size={16} />
                    {label}
                    <ChevronDown size={12} />
                  </summary>
                  <ul>
                    {childrenByProduct[label].map((item) => (
                      <li key={item}>
                        {item === "Transactions" ? (
                          <Link href="/payments" onClick={navigate}>
                            View payments
                          </Link>
                        ) : (
                          <button type="button" className="product-item">
                            {item}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              ) : (
                <button type="button" key={label} className="navrow">
                  <Icon size={16} />
                  {label}
                </button>
              ),
            )}
          </section>
        ))}
      </nav>
      <button type="button" className="navrow developers">
        <svg
          aria-hidden="true"
          viewBox="0 0 18 18"
          width="17"
          height="17"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="1.5" y="3" width="15" height="12" rx="2.5" />
          <path d="m4.7 6.2 3 2.8-3 2.8M9.6 11.8h3.2" />
        </svg>
        Developers
      </button>
    </div>
  );
}
