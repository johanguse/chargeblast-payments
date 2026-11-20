import { Settings, X } from "lucide-react";
import { Popover } from "@/components/ui/popover";
import { MAX_COLUMN_WIDTH, minColumnWidth } from "../domain/columns";
import type { ColumnLayout } from "../hooks/use-column-layout";

/** "Edit columns" popover: wrapping, visibility, order and widths. */
export function ColumnSettings({ layout }: { layout: ColumnLayout }) {
  const { order, widths, hidden, wrap } = layout;
  return (
    <Popover
      label="Edit columns"
      trigger={
        <>
          <Settings /> Edit columns
        </>
      }
      triggerClassName="outline"
      panelClassName="columns-popover"
      align="end"
    >
      {(close) => (
        <>
          <button
            type="button"
            className="close"
            aria-label="Close table settings"
            onClick={close}
          >
            <X />
          </button>
          <h2>Table settings</h2>
          <label className="column-option">
            <input
              type="checkbox"
              role="switch"
              aria-checked={wrap}
              checked={wrap}
              onChange={(e) => layout.setWrap(e.target.checked)}
            />
            Wrap cells
          </label>
          <fieldset>
            <legend>Columns</legend>
            {order.map((c) => (
              <label className="column-option" key={c}>
                <input
                  type="checkbox"
                  checked={!hidden.has(c)}
                  onChange={(e) => layout.setVisible(c, e.target.checked)}
                />
                {c}
              </label>
            ))}
          </fieldset>
          <details>
            <summary>Column order and widths</summary>
            {order.map((c, i) => (
              <div className="setting" key={c}>
                <b>{c}</b>
                <input
                  aria-label={`${c} width`}
                  type="range"
                  min={minColumnWidth(c)}
                  max={MAX_COLUMN_WIDTH}
                  value={widths[c]}
                  onChange={(e) => layout.resize(c, Number(e.target.value))}
                />
                <button
                  type="button"
                  disabled={!i}
                  aria-label={`Move ${c} left`}
                  onClick={() => layout.move(c, order[i - 1])}
                >
                  ←
                </button>
                <button
                  type="button"
                  disabled={i === order.length - 1}
                  aria-label={`Move ${c} right`}
                  onClick={() => layout.move(c, order[i + 1])}
                >
                  →
                </button>
              </div>
            ))}
          </details>
          <button type="button" onClick={layout.reset}>
            Reset to default
          </button>
        </>
      )}
    </Popover>
  );
}
