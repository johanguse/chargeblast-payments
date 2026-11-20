import {
  ChevronLeft,
  CircleCheck,
  CircleDot,
  CreditCard,
  Landmark,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { formatDateTime, formatMoney } from "../../domain/format";
import type { Payment } from "../../domain/payment";
import { StatusBadge } from "../table/cells/status-badge";
import { Fields } from "./fields";
import { Section } from "./section";

const methodIcons = { Card: CreditCard, ACH: Landmark, Wallet };
const MINUTE = 60_000;

export function PaymentDetails({
  payment: p,
  timeZone,
  backHref,
}: {
  payment: Payment;
  timeZone: string;
  backHref: string;
}) {
  const MethodIcon = methodIcons[p.method];
  const ActivityIcon = p.status === "Succeeded" ? CircleCheck : CircleDot;
  const method = `${p.brand} •••• ${p.last4}`;
  const amount = formatMoney(p);
  const created = formatDateTime(p.created, timeZone);
  const started = formatDateTime(p.created - MINUTE, timeZone);

  return (
    <main id="main-content" tabIndex={-1} className="main detail-main">
      <nav aria-label="Breadcrumb">
        <Link className="payment-back" href={backHref}>
          <ChevronLeft size={15} />
          Transactions
        </Link>
      </nav>
      <div className="payment-heading">
        <h1>
          {amount} <small>{p.currency}</small>
        </h1>
        <StatusBadge status={p.status} withIcon={false} />
      </div>
      <p className="payment-customer">
        {p.status === "Succeeded" ? "Charged to" : "Customer"}{" "}
        <strong>{p.name}</strong>
      </p>
      <div className="payment-layout">
        <div className="payment-story">
          <Section title="Recent activity" delay={500}>
            <ol className="payment-events">
              <li>
                <ActivityIcon />
                <div>
                  <strong>Payment {p.status.toLowerCase()}</strong>
                  <time dateTime={new Date(p.created).toISOString()}>
                    {created}
                  </time>
                </div>
              </li>
              <li>
                <CircleDot />
                <div>
                  <strong>Payment started</strong>
                  <time dateTime={new Date(p.created - MINUTE).toISOString()}>
                    {started}
                  </time>
                </div>
              </li>
            </ol>
          </Section>
          <Section title="Checkout summary" delay={340}>
            <Fields rows={{ Customer: p.email, Description: p.description }} />
          </Section>
          <Section title="Payment breakdown" delay={340}>
            <Fields rows={{ "Payment amount": `${amount} ${p.currency}` }} />
          </Section>
          <Section title="Payment method" delay={700}>
            <div className="method-summary">
              <MethodIcon size={20} />
              <strong>{method}</strong>
            </div>
            <Fields
              rows={{
                Type: p.method,
                ...(p.method === "Wallet" ? { Wallet: p.wallet } : {}),
                Owner: p.name,
                "Owner email": p.email,
              }}
            />
          </Section>
          <section>
            <h2>Events</h2>
            <dl className="event-list">
              <div>
                <dt>
                  Payment {p.id} · {p.status}
                </dt>
                <dd>{created}</dd>
              </div>
              <div>
                <dt>Payment created for {amount}</dt>
                <dd>{started}</dd>
              </div>
            </dl>
          </section>
        </div>
        <div className="payment-rail">
          <Section title="Details" delay={450}>
            <Fields
              rows={{
                "Payment ID": p.id,
                "Payment method": method,
                Description: p.description,
                "Last updated": created,
              }}
            />
          </Section>
          <Section title="Customer" delay={650}>
            <Fields rows={{ Name: p.name, Email: p.email }} />
          </Section>
          <Section title="Metadata" delay={800}>
            <Fields rows={{ Environment: "Sandbox", Source: "cramly.ai" }} />
          </Section>
        </div>
      </div>
    </main>
  );
}
