import { X } from "lucide-react";
import { useState } from "react";
import { AddCircleIcon } from "@/components/icons/ui-icons";
import { Popover } from "@/components/ui/popover";
import {
  clearFilterGroup,
  filterGroups,
  filterValuesFromForm,
  summarizeFilter,
} from "../../domain/filters";
import type { UpdateParams } from "../../hooks/use-payments-query";
import { FilterEditor } from "./filter-editor";

/** One pill per filter group; each opens an editor in a popover. */
export function FilterBar({
  params,
  update,
}: {
  params: URLSearchParams;
  update: UpdateParams;
}) {
  const [draft, setDraft] = useState<{ label: string; value: string } | null>(
    null,
  );
  return (
    // biome-ignore lint/a11y/useSemanticElements: a <fieldset> would add a border and legend layout.
    <div className="pills" role="group" aria-label="Payment filters">
      {filterGroups.map((g) => {
        const active = summarizeFilter(g, params);
        const display = draft?.label === g.label ? draft.value : active;
        return (
          <div className="pill" key={g.label}>
            {active && (
              <button
                type="button"
                aria-label={`Clear ${g.label} filter`}
                onClick={() => update((p) => clearFilterGroup(g, p))}
              >
                <X size={12} />
              </button>
            )}
            <Popover
              label={`Filter by ${g.label.toLowerCase()}`}
              description={display || undefined}
              onDismiss={() =>
                setDraft((old) => (old?.label === g.label ? null : old))
              }
              trigger={
                <>
                  {!display && <AddCircleIcon width={16} height={16} />}{" "}
                  {g.label} {display && <b>{display}</b>}
                </>
              }
            >
              {(close) => (
                <FilterEditor
                  group={g}
                  params={params}
                  onBack={close}
                  onPreview={(fields) =>
                    setDraft({
                      label: g.label,
                      value: summarizeFilter(g, filterValuesFromForm(fields)),
                    })
                  }
                  onSave={(fields) => {
                    update((p) => {
                      clearFilterGroup(g, p);
                      for (const [key, value] of filterValuesFromForm(fields))
                        p.append(key, value);
                    });
                    close();
                  }}
                />
              )}
            </Popover>
          </div>
        );
      })}
    </div>
  );
}
