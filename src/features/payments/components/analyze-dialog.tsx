import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { isBackdropClick } from "@/lib/dialog";
import { type Payment, statuses } from "../domain/payment";

/** Modal with a per-status breakdown of the current result set. */
export function AnalyzeDialog({
  open,
  payments,
  onClose,
}: {
  open: boolean;
  payments: Payment[];
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click is a mouse shortcut; Escape closes the dialog natively.
    <dialog
      ref={dialog}
      aria-label={open ? "Analyze" : "Payments options"}
      onClose={onClose}
      onClick={(e) => {
        if (isBackdropClick(e, dialog.current)) onClose();
      }}
    >
      <button
        type="button"
        className="close"
        aria-label="Close"
        onClick={onClose}
      >
        <X />
      </button>
      {open && (
        <>
          <h2>Analyze payments</h2>
          <p>{payments.length} matching payments</p>
          <dl className="payment-fields">
            {statuses.map((status) => (
              <div key={status}>
                <dt>{status}</dt>
                <dd>{payments.filter((p) => p.status === status).length}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </dialog>
  );
}
