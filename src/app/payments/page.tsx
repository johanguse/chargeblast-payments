import { Suspense } from "react";
import { PaymentsScreen } from "@/features/payments/components/payments-screen";
import { seedPayments } from "@/features/payments/data/seed";
import { mockResponse, paymentsListDelayMs } from "@/lib/mock-response";

export const dynamic = "force-dynamic";

async function PaymentsList({ now }: { now: number }) {
  const data = await mockResponse(seedPayments(now), paymentsListDelayMs);
  return <PaymentsScreen now={now} data={data} />;
}

export default function PaymentsPage() {
  const now = Date.now();
  return (
    <Suspense fallback={<PaymentsScreen now={now} data={[]} loading />}>
      <PaymentsList now={now} />
    </Suspense>
  );
}
