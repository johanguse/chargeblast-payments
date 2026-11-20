import { Suspense } from "react";
import {
  type TransactionTab,
  tabSlug,
  transactionTabs,
} from "@/features/payments/components/page-heading";
import { PaymentsScreen } from "@/features/payments/components/payments-screen";
import { seedPayments } from "@/features/payments/data/seed";
import { mockResponse, paymentsListDelayMs } from "@/lib/mock-response";

export const dynamic = "force-dynamic";

async function PaymentsList({
  now,
  activeTab,
}: {
  now: number;
  activeTab: TransactionTab;
}) {
  const data = await mockResponse(seedPayments(now), paymentsListDelayMs);
  return <PaymentsScreen activeTab={activeTab} now={now} data={data} />;
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[] }>;
}) {
  const { view } = await searchParams;
  const activeTab =
    transactionTabs.find((tab) => tabSlug(tab) === view) ?? "Payments";
  const now = Date.now();
  return (
    <Suspense
      fallback={
        <PaymentsScreen activeTab={activeTab} now={now} data={[]} loading />
      }
    >
      <PaymentsList activeTab={activeTab} now={now} />
    </Suspense>
  );
}
