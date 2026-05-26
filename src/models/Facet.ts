import powerbi from "powerbi-visuals-api";

export type SelectorType = "dropdown" | "chips" | "toggle" | "list" | "radio" | "checkbox";
export type SelectionMode = "single" | "multi";
export type FacetSortOrder = "asc" | "desc" | "data";

export interface FacetOption {
  key: string;
  label: string;
  rawValue: powerbi.PrimitiveValue;
}

export interface FacetColumn {
  index: number;
  queryName: string;
  displayName: string;
  title: string;
  selectorType: SelectorType;
  selectionMode: SelectionMode;
  hidden: boolean;
  options: FacetOption[];
  availableKeys: Set<string>;
  selectedKeys: string[];
  filterPropertyName: string;
}
