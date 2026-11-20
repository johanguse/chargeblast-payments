import { X } from "lucide-react";
import { useState } from "react";
import { SparkleIcon } from "@/components/icons/ui-icons";

export function AnnouncementBanner({ onDismiss }: { onDismiss?: () => void }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="sigma-banner">
      <strong>
        <SparkleIcon width={12} height={12} /> New
      </strong>
      <span>
        Rule Attributes are now in Sigma and Data Pipeline for better fraud
        insights.
      </span>
      <a
        href="https://docs.stripe.com/stripe-data"
        target="_blank"
        rel="noreferrer"
      >
        Get started
      </a>
      <button
        type="button"
        aria-label="Dismiss announcement"
        onClick={() => {
          setVisible(false);
          onDismiss?.();
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
