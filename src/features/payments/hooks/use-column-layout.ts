import { useCallback, useMemo, useState } from "react";
import {
  availableColumns,
  type Column,
  clampColumnWidth,
  defaultWidths,
  moveColumn,
  optionalColumns,
} from "../domain/columns";

/** Column order, visibility, widths and wrapping for the payments table. */
export function useColumnLayout() {
  const [order, setOrder] = useState<Column[]>(availableColumns);
  const [widths, setWidths] = useState(defaultWidths);
  const [hidden, setHidden] = useState<Set<Column>>(
    () => new Set(optionalColumns),
  );
  const [wrap, setWrap] = useState(false);

  const move = useCallback(
    (column: Column, target: Column) =>
      setOrder((old) => moveColumn(old, column, target)),
    [],
  );

  const resize = useCallback(
    (column: Column, width: number) =>
      setWidths((old) => ({
        ...old,
        [column]: clampColumnWidth(column, width),
      })),
    [],
  );

  const setVisible = useCallback((column: Column, visible: boolean) => {
    setHidden((old) => {
      const next = new Set(old);
      if (visible) next.delete(column);
      else next.add(column);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setHidden(new Set(optionalColumns));
    setWrap(false);
    setOrder([...availableColumns]);
    setWidths(defaultWidths);
  }, []);

  const visibleColumns = useMemo(
    () => order.filter((c) => !hidden.has(c)),
    [order, hidden],
  );

  return {
    order,
    widths,
    hidden,
    wrap,
    visibleColumns,
    move,
    resize,
    setVisible,
    setWrap,
    reset,
  };
}

export type ColumnLayout = ReturnType<typeof useColumnLayout>;
