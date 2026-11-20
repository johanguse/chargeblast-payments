import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <main id="main-content" tabIndex={-1} className="main detail-loading">
      <Spinner label="Loading payment" />
    </main>
  );
}
