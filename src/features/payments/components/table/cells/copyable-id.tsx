import { CopyIcon } from "@/components/icons/copy-icon";

export function CopyableId({
  id,
  onCopy,
}: {
  id: string;
  onCopy: (id: string) => void;
}) {
  return (
    <button
      type="button"
      className="id"
      aria-label={`Copy payment ID ${id}`}
      onClick={() => onCopy(id)}
    >
      {id}
      <CopyIcon />
    </button>
  );
}
