import * as Tooltip from "@radix-ui/react-tooltip";
import {
  Bell,
  LayoutGrid,
  MessageCircleQuestionMark,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import { useRef } from "react";
import { useSearchShortcut } from "../hooks/use-search-shortcut";

const tools = [
  { label: "Help", Icon: MessageCircleQuestionMark, className: "desktop-tool" },
  { label: "Notifications", Icon: Bell, className: "notifications-tool" },
  { label: "Settings", Icon: Settings, className: "desktop-tool" },
  { label: "Create", Icon: Plus, className: "create-tool" },
];

export function TopBar({
  search,
  onSearch,
}: {
  search: string;
  onSearch: (value: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  useSearchShortcut(input);
  return (
    <header>
      <label className="search">
        <Search size={15} />
        <input
          ref={input}
          aria-label="Search by payment ID, email or last four digits"
          placeholder="Search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </label>
      <div className="tools">
        <div className="mode-notice">
          Test mode has moved. <u>Show me</u>
        </div>
        <div className="pinned-apps" aria-hidden="true">
          <span className="app-mark app-mark-loop" />
          <span className="app-mark app-mark-orbit" />
          <span className="app-mark app-mark-arrow" />
          <LayoutGrid size={16} />
        </div>
        <div className="header-actions">
          <Tooltip.Provider delayDuration={300}>
            {tools.map(({ label, Icon, className }) => (
              <Tooltip.Root key={label}>
                <Tooltip.Trigger asChild>
                  <button
                    type="button"
                    className={className}
                    aria-label={label}
                  >
                    <Icon aria-hidden="true" />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="header-tooltip"
                    side="bottom"
                    sideOffset={4}
                  >
                    {label}
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            ))}
          </Tooltip.Provider>
        </div>
      </div>
    </header>
  );
}
