import { type RefObject, useEffect } from "react";

const typingTargets = ["INPUT", "TEXTAREA", "SELECT"];

export function useSearchShortcut(input: RefObject<HTMLInputElement | null>) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !document.querySelector("dialog[open], :popover-open") &&
        !typingTargets.includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [input]);
}
