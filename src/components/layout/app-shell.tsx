"use client";
import { LayoutGrid } from "lucide-react";
import { type ReactNode, useRef, useState } from "react";
import { isBackdropClick } from "@/lib/dialog";
import { Sidebar } from "./sidebar";

import type { Workspace } from "./workspace-switcher";

export function AppShell({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<Workspace>({
    company: "SpeedSEO",
    sandbox: true,
  });
  const drawer = useRef<HTMLDialogElement>(null);
  return (
    <>
      {/* First focusable element, so keyboard users can bypass the sidebar. */}
      <a href="#main-content" className="skip">
        Skip to main content
      </a>
      <aside aria-label="Sidebar">
        <Sidebar workspace={workspace} onSwitch={setWorkspace} />
      </aside>
      <button
        type="button"
        className="mobile shell-menu"
        aria-haspopup="dialog"
        aria-label="Open workspace menu"
        onClick={() => drawer.current?.showModal()}
      >
        <LayoutGrid />
      </button>
      {children}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click is a mouse shortcut; Escape closes the dialog natively. */}
      <dialog
        ref={drawer}
        aria-label="Workspace navigation"
        className="nav-drawer"
        onClick={(e) => {
          if (isBackdropClick(e, drawer.current)) drawer.current?.close();
        }}
      >
        <button
          type="button"
          aria-label="Close navigation"
          className="close-drawer"
          onClick={() => drawer.current?.close()}
        >
          ×
        </button>
        <Sidebar
          workspace={workspace}
          onSwitch={setWorkspace}
          navigate={() => drawer.current?.close()}
        />
      </dialog>
    </>
  );
}
