import { ArrowRight, ChevronLeft, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import {
  amountOperators,
  type FilterGroup,
  filterChoices,
  validateFilterForm,
} from "../../domain/filters";
import { roundFilterAmount } from "../../domain/format";
import { dateRangePresets } from "../../domain/query";

/** The form inside a filter pill's popover. */
export function FilterEditor({
  group,
  params,
  onPreview,
  onSave,
  onBack,
}: {
  group: FilterGroup;
  params: URLSearchParams;
  onPreview: (fields: FormData) => void;
  onSave: (fields: FormData) => void;
  onBack: () => void;
}) {
  const key = group.keys[0];
  const [range, setRange] = useState(params.get("range") || "Today");
  const [op, setOp] = useState(
    params.get("op") ||
      (params.has("min") || params.has("max") ? "between" : "eq"),
  );
  const [error, setError] = useState("");

  return (
    <form
      onChange={(e) => {
        const form = e.currentTarget;
        requestAnimationFrame(() => {
          if (form.isConnected) onPreview(new FormData(form));
        });
      }}
      onSubmit={(e) => {
        e.preventDefault();
        const fields = new FormData(e.currentTarget);
        const problem = validateFilterForm(group, fields);
        if (problem) setError(problem);
        else onSave(fields);
      }}
    >
      <div className="filter-heading">
        <button type="button" aria-label="Back" onClick={onBack}>
          <ChevronLeft size={12} />
        </button>
        <h2>{key === "q" ? "Search payments" : group.label}</h2>
      </div>
      {filterChoices[key]?.map((v) => (
        <label className="option" key={v}>
          <input
            type="checkbox"
            name={key}
            value={v}
            defaultChecked={params.getAll(key).includes(v)}
          />
          {v}
        </label>
      ))}
      {key === "range" && (
        <>
          <select
            name="range"
            aria-label="Date range"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          >
            {dateRangePresets.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          {range === "Custom" &&
            (["from", "to"] as const).map((k) => (
              <label key={k}>
                {k === "from" ? "Start date" : "End date"}
                <input
                  type="date"
                  name={k}
                  required
                  defaultValue={params.get(k) || ""}
                />
              </label>
            ))}
        </>
      )}
      {key === "op" && (
        <AmountFields
          op={op}
          params={params}
          onOpChange={(value) => {
            setOp(value);
            setError("");
          }}
          onInput={() => setError("")}
        />
      )}
      {key === "q" && (
        <label>
          Payment ID, email or last four digits
          <input name="q" defaultValue={params.get("q") || ""} />
        </label>
      )}
      {error && <p role="alert">{error}</p>}
      <button
        type="submit"
        data-testid="apply-filter-button"
        className="primary"
      >
        Apply
      </button>
    </form>
  );
}

function AmountFields({
  op,
  params,
  onOpChange,
  onInput,
}: {
  op: string;
  params: URLSearchParams;
  onOpChange: (op: string) => void;
  onInput: () => void;
}) {
  const fields =
    op === "between" ? ["min", "max"] : [op === "lt" ? "max" : "min"];
  return (
    <>
      <div className="filter-condition">
        <select
          aria-label="Number filter select"
          name="op"
          value={op}
          onChange={(e) => onOpChange(e.target.value)}
        >
          {Object.entries(amountOperators).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <ChevronsUpDown size={16} aria-hidden="true" />
      </div>
      <div className="filter-values">
        <ArrowRight size={12} aria-hidden="true" />
        {fields.map((k) => (
          <label key={k}>
            <span className={op === "between" ? "range-label" : "sr"}>
              {op === "between"
                ? k === "min"
                  ? "Minimum"
                  : "Maximum"
                : "Filter value"}
            </span>
            <input
              type="number"
              min="0"
              step="any"
              onBlur={(e) => {
                e.currentTarget.value = roundFilterAmount(
                  e.currentTarget.value,
                );
              }}
              placeholder="0"
              required={op !== "between"}
              name={k}
              defaultValue={params.get(k) || ""}
              onInput={onInput}
            />
          </label>
        ))}
      </div>
    </>
  );
}
