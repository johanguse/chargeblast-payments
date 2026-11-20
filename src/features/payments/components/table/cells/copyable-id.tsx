import * as Tooltip from "@radix-ui/react-tooltip";
import { CopyIcon } from "@/components/icons/copy-icon";

export function CopyableId({
  id,
  onCopy,
}: {
  id: string;
  onCopy: (id: string) => void;
}) {
  const shortId = id.length > 16 ? `${id.slice(0, 8)}…${id.slice(-6)}` : id;
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          className="id"
          aria-label={`Copy payment ID ${id}`}
          onClick={() => onCopy(id)}
        >
          {shortId}
          <CopyIcon />
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="id-tooltip"
          side="top"
          sideOffset={6}
          collisionPadding={8}
          hideWhenDetached
        >
          {id}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
