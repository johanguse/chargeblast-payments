import { Ellipsis, Mail, Undo2 } from "lucide-react";
import Link from "next/link";
import { Popover } from "@/components/ui/popover";

const quickActions = [
  { label: "Refund payment", Icon: Undo2 },
  { label: "Send receipt", Icon: Mail },
] as const;

/** Hover shortcuts plus the "More actions" menu at the end of each row. */
export function RowActions({
  id,
  href,
  showQuickActions,
  onCopyId,
}: {
  id: string;
  href: string;
  showQuickActions: boolean;
  onCopyId: (id: string) => void;
}) {
  return (
    <div className="row-tools">
      {showQuickActions &&
        quickActions.map(({ label, Icon }) => (
          <button
            key={label}
            type="button"
            className="quick"
            aria-label={label}
            aria-disabled="true"
            title={`${label} (unavailable in sandbox)`}
          >
            <Icon size={14} />
          </button>
        ))}
      <Popover
        label={`More actions for ${id}`}
        trigger={<Ellipsis size={16} />}
      >
        {(close) => (
          <div className="action-list">
            {showQuickActions &&
              quickActions.map(({ label }) => (
                <button
                  type="button"
                  key={label}
                  disabled
                  title="Unavailable in sandbox"
                >
                  {label}
                </button>
              ))}
            <Link href={href} onClick={close}>
              View payment details
            </Link>
            <button
              type="button"
              onClick={() => {
                onCopyId(id);
                close();
              }}
            >
              Copy payment ID
            </button>
          </div>
        )}
      </Popover>
    </div>
  );
}
