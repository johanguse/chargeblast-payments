import { ChevronDown } from "lucide-react";
import Link from "next/link";
import {
  BalancesIcon,
  BillingIcon,
  ClockIcon,
  ConnectIcon,
  CustomersIcon,
  DevelopersIcon,
  HomeIcon,
  MoreIcon,
  PinIcon,
  ProductCatalogIcon,
  ReportingIcon,
  TransactionsIcon,
  WalletIcon,
} from "@/components/icons/nav-icons";
import { type WorkspaceProps, WorkspaceSwitcher } from "./workspace-switcher";

const groups = [
  {
    title: "",
    items: [
      ["Home", HomeIcon],
      ["Balances", BalancesIcon],
      ["Transactions", TransactionsIcon],
      ["Customers", CustomersIcon],
      ["Product catalog", ProductCatalogIcon],
    ],
  },
  {
    title: "Shortcuts",
    items: ["Payments analytics", "Reports", "Sigma", "Radar"].map(
      (s) => [s, s === "Payments analytics" ? PinIcon : ClockIcon] as const,
    ),
  },
  {
    title: "Products",
    items: [
      ["Connect", ConnectIcon],
      ["Payments", WalletIcon],
      ["Billing", BillingIcon],
      ["Reporting", ReportingIcon],
      ["More", MoreIcon],
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
                  <Icon />
                  {label}
                </Link>
              ) : g.title === "Products" ? (
                <details key={label} className="product-group">
                  <summary className="navrow">
                    <Icon />
                    {label}
                    <ChevronDown width={12} height={12} />
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
                  <Icon />
                  {label}
                </button>
              ),
            )}
          </section>
        ))}
      </nav>
      <button type="button" className="navrow developers">
        <DevelopersIcon />
        Developers
      </button>
    </div>
  );
}
