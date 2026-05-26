import { FacetColumn, FacetOption } from "../models/Facet";

export interface CategoricalRow {
  values: string[];
}

export function buildAvailableKeysWithCascade(
  facets: FacetColumn[],
  rows: CategoricalRow[],
  enableCascade: boolean
): Map<number, Set<string>> {
  const result = new Map<number, Set<string>>();

  if (!enableCascade) {
    for (const facet of facets) {
      result.set(facet.index, new Set(facet.options.map((option) => option.key)));
    }
    return result;
  }

  for (const facet of facets) {
    const available = new Set<string>();
    const otherFacets = facets.filter((other) => other.index !== facet.index && other.selectedKeys.length > 0);

    for (const row of rows) {
      let passes = true;
      for (const other of otherFacets) {
        const value = row.values[other.index];
        if (!other.selectedKeys.includes(value)) {
          passes = false;
          break;
        }
      }
      if (passes) {
        available.add(row.values[facet.index]);
      }
    }

    // Always keep the currently-selected keys visible/changeable even if the
    // cascade from other facets filters them out. Without this the user would
    // be unable to deselect a value that no longer has any matching rows.
    for (const selectedKey of facet.selectedKeys) {
      available.add(selectedKey);
    }

    result.set(facet.index, available);
  }

  return result;
}

export function sortAndFilterOptions(
  options: FacetOption[],
  availableKeys: Set<string>,
  searchTerm: string,
  sortOrder: "asc" | "desc" | "data"
): FacetOption[] {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filtered = options.filter((option) => {
    if (!availableKeys.has(option.key)) {
      return false;
    }
    if (!normalizedSearch) {
      return true;
    }
    return option.label.toLowerCase().includes(normalizedSearch);
  });

  if (sortOrder === "data") {
    return filtered;
  }

  const direction = sortOrder === "desc" ? -1 : 1;
  return [...filtered].sort((a, b) => a.label.localeCompare(b.label) * direction);
}
