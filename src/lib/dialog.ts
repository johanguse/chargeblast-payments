import type { MouseEvent } from "react";

/**
 * True when a click on a modal <dialog> landed on its ::backdrop.
 * Clicks on the backdrop target the dialog element itself but fall outside
 * its box, so this lets dialogs close on an outside click.
 */
export function isBackdropClick(
  e: MouseEvent<HTMLDialogElement>,
  dialog: HTMLDialogElement | null,
) {
  if (!dialog || e.target !== dialog) return false;
  const r = dialog.getBoundingClientRect();
  return (
    e.clientX < r.left ||
    e.clientX > r.right ||
    e.clientY < r.top ||
    e.clientY > r.bottom
  );
}
