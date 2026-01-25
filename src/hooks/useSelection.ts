import { useState } from "react";

export function useSelection<T>(items: T[] | undefined, getId: (item: T) => number) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  function toggle(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function selectAll() {
    if (!items) return;
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(getId));
    }
  }

  function clear() {
    setSelectedIds([]);
  }

  return { selectedIds, toggle, selectAll, clear };
}