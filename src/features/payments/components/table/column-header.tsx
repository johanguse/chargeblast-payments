import { ArrowDown, ArrowUp } from "lucide-react";
import type { PointerEvent } from "react";
import { type Column, isSortable } from "../../domain/columns";

export function ColumnHeader({
  column,
  width,
  sort,
  onSort,
  onResize,
  onDragStart,
  onDrop,
}: {
  column: Column;
  width: number;
  sort: { column: Column; ascending: boolean };
  onSort: (column: Column) => void;
  onResize: (column: Column, width: number) => void;
  onDragStart: (column: Column) => void;
  onDrop: (target: Column) => void;
}) {
  const sortable = isSortable(column),
    active = sort.column === column;

  function startResize(e: PointerEvent<HTMLSpanElement>) {
    e.preventDefault();
    const handle = e.currentTarget,
      startX = e.clientX;
    handle.setPointerCapture(e.pointerId);
    handle.onpointermove = (ev) =>
      onResize(column, width + ev.clientX - startX);
    handle.onpointerup = () => {
      handle.onpointermove = null;
    };
  }

  return (
    <th
      scope="col"
      data-column={column}
      className={column === "Amount" ? "numeric" : ""}
      aria-sort={
        sortable && active
          ? sort.ascending
            ? "ascending"
            : "descending"
          : undefined
      }
      draggable
      onDragStart={() => onDragStart(column)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(column)}
    >
      {sortable ? (
        <button type="button" onClick={() => onSort(column)}>
          {column}
          {active && (sort.ascending ? <ArrowUp /> : <ArrowDown />)}
        </button>
      ) : (
        column
      )}
      <span className="resize" onPointerDown={startResize} />
    </th>
  );
}
