import {
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export function Popover({
  label,
  trigger,
  description,
  align = "start",
  triggerClassName,
  panelClassName,
  onDismiss,
  children,
}: {
  label: string;
  trigger: ReactNode;
  description?: string;
  align?: "start" | "end";
  triggerClassName?: string;
  panelClassName?: string;
  onDismiss?: () => void;
  children: (close: () => void) => ReactNode;
}) {
  const id = useId(),
    button = useRef<HTMLButtonElement>(null),
    popup = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useLayoutEffect(() => {
    if (!open) return;
    function position() {
      const anchor = button.current?.getBoundingClientRect();
      const panel = popup.current;
      if (!anchor || !panel) return;
      const gutter = 8,
        gap = 4;
      const startY = anchor.bottom + gap;
      const below = window.innerHeight - startY - gutter;
      const above = anchor.top - gap - gutter;
      const naturalHeight = Math.min(
        panel.scrollHeight + panel.clientTop * 2,
        window.innerHeight * 0.65,
      );
      const placeBelow = below >= naturalHeight || below >= above;
      panel.style.maxHeight = `min(65vh, ${Math.max(0, placeBelow ? below : above)}px)`;
      const left =
        align === "end" ? anchor.right - panel.offsetWidth : anchor.left;
      panel.style.left = `${Math.max(
        gutter,
        Math.min(left, window.innerWidth - panel.offsetWidth - gutter),
      )}px`;
      panel.style.top = `${
        placeBelow
          ? startY
          : Math.max(gutter, anchor.top - gap - panel.offsetHeight)
      }px`;
    }
    position();
    popup.current
      ?.querySelector<HTMLElement>(
        "input:enabled,select:enabled,a[href],button:enabled,summary",
      )
      ?.focus({ preventScroll: true });
    const observer = new ResizeObserver(position);
    if (popup.current) observer.observe(popup.current);
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  }, [open, align]);
  function close() {
    popup.current?.hidePopover();
    button.current?.focus({ preventScroll: true });
  }
  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        ref={button}
        popoverTarget={id}
        aria-label={label}
        aria-description={description}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {trigger}
      </button>
      <div
        ref={popup}
        id={id}
        role="dialog"
        aria-label={label}
        popover="auto"
        style={{ visibility: open ? undefined : "hidden" }}
        className={["anchored", panelClassName].filter(Boolean).join(" ")}
        onToggle={(e) => {
          setOpen(e.newState === "open");
          if (e.newState === "closed") onDismiss?.();
        }}
      >
        {open && children(close)}
      </div>
    </>
  );
}
