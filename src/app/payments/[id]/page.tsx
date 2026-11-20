import { notFound } from "next/navigation";
import { PaymentDetails } from "@/features/payments/components/details/payment-details";
import { seedPayments } from "@/features/payments/data/seed";
import {
  parseSnapshotTime,
  paymentsListHref,
  resolveTimeZone,
} from "@/features/payments/domain/routes";
import { mockResponse } from "@/lib/mock-response";

export const dynamic = "force-dynamic";

export default async function PaymentDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ at?: string; back?: string; tz?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const payment = await mockResponse(
    seedPayments(parseSnapshotTime(query.at)).find((row) => row.id === id),
    250,
  );
  if (!payment) notFound();
  return (
    <PaymentDetails
      payment={payment}
      timeZone={resolveTimeZone(query.tz)}
      backHref={paymentsListHref(query.back)}
    />
  );
}
