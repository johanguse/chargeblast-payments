import { type ReactNode, Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { mockResponse } from "@/lib/mock-response";

async function DelayedBody({
  children,
  delay,
}: {
  children: ReactNode;
  delay: number;
}) {
  return await mockResponse(children, delay);
}

/**
 * A details card that streams in on its own, simulating a section backed by
 * a separate request.
 */
export function Section({
  title,
  delay,
  children,
}: {
  title: string;
  delay: number;
  children: ReactNode;
}) {
  return (
    <section>
      <h2>{title}</h2>
      <Suspense fallback={<Spinner label={`Loading ${title.toLowerCase()}`} />}>
        <DelayedBody delay={delay}>{children}</DelayedBody>
      </Suspense>
    </section>
  );
}
