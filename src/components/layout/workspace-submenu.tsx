import { ChevronRight, type LucideIcon } from "lucide-react";
import {
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export function WorkspaceSubmenu({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const leaveTimer = useRef<number | undefined>(undefined);
  const [open, setOpen] = useState(false);

  const position = useCallback(() => {
    const row = trigger.current?.getBoundingClientRect();
    const el = panel.current;
    if (!row || !el) return;
    const gutter = 8,
      gap = 4;
    const rightLimit = window.innerWidth - el.offsetWidth - gutter;
    let left = row.right + gap;
    if (left > rightLimit) {
      const flipped = row.left - gap - el.offsetWidth;
      left = flipped >= gutter ? flipped : rightLimit;
    }
    el.style.left = `${Math.max(gutter, left)}px`;
    el.style.top = `${Math.max(gutter, Math.min(row.top, window.innerHeight - el.offsetHeight - gutter))}px`;
  }, []);

  function show(focus = false) {
    window.clearTimeout(leaveTimer.current);
    const el = panel.current;
    if (!el) return;
    el.showPopover();
    position();
    if (focus)
      (el.querySelector<HTMLElement>("button:enabled") ?? el).focus({
        preventScroll: true,
      });
  }

  useEffect(() => () => window.clearTimeout(leaveTimer.current), []);
  useLayoutEffect(() => {
    if (!open) return;
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  }, [open, position]);

  function onPanelKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft" || event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      panel.current?.hidePopover();
      trigger.current?.focus();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const items = Array.from(
        event.currentTarget.querySelectorAll<HTMLButtonElement>(
          "button:enabled",
        ),
      );
      if (!items.length) return;
      const index =
        document.activeElement instanceof HTMLButtonElement
          ? items.indexOf(document.activeElement)
          : -1;
      const step = event.key === "ArrowDown" ? 1 : -1;
      items[(index + step + items.length) % items.length].focus();
    }
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: tracks pointer and focus leaving both the button and its flyout.
    <div
      onPointerEnter={() => window.clearTimeout(leaveTimer.current)}
      onPointerLeave={(event) => {
        if (
          event.pointerType === "mouse" &&
          !panel.current?.contains(document.activeElement)
        ) {
          leaveTimer.current = window.setTimeout(
            () => panel.current?.hidePopover(),
            180,
          );
        }
      }}
      onBlur={(event) => {
        if (
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget)
        )
          panel.current?.hidePopover();
      }}
    >
      <button
        ref={trigger}
        type="button"
        popoverTarget={id}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={id}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") show();
        }}
        onClick={(event) => {
          event.preventDefault();
          show(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            show(true);
          }
        }}
      >
        <Icon />
        {label}
        <ChevronRight />
      </button>
      <div
        id={id}
        ref={panel}
        role="dialog"
        aria-label={label}
        popover="auto"
        tabIndex={-1}
        className="anchored workspace-flyout"
        onToggle={(event) => setOpen(event.newState === "open")}
        onKeyDown={onPanelKey}
      >
        {children}
      </div>
    </div>
  );
}
