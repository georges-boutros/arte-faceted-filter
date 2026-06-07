import powerbi from "powerbi-visuals-api";

export interface FilterColumnTarget {
  table: string;
  column: string;
}

export interface BasicValuesFilter {
  $schema: string;
  target: FilterColumnTarget;
  operator: "In";
  values: powerbi.PrimitiveValue[];
  filterType: 1;
}

export function parseQueryNameToTarget(queryName: string | undefined): FilterColumnTarget | null {
  if (!queryName) {
    return null;
  }

  const dotted = /^(.+)\.([^.[\]]+)$/.exec(queryName);
  if (dotted?.[1] && dotted?.[2]) {
    return { table: dotted[1], column: dotted[2] };
  }

  const bracketed = /^'?(.+?)'?\[(.+)\]$/.exec(queryName);
  if (bracketed?.[1] && bracketed?.[2]) {
    return { table: bracketed[1], column: bracketed[2] };
  }

  return null;
}

export function createBasicValuesFilter(
  target: FilterColumnTarget,
  values: powerbi.PrimitiveValue[]
): BasicValuesFilter {
  return {
    $schema: "https://powerbi.com/product/schema#basic",
    target,
    operator: "In",
    values,
    filterType: 1
  };
}

/**
 * Apply (or clear) every active facet filter in a single host.applyJsonFilter
 * call. Power BI only fully cross-filters the report from one filter property
 * — we pass an IFilter[] containing every active facet's basic IN filter so
 * each report visual receives the AND-combination of all active facets.
 */
export function applyAllFacetFilters(
  host: powerbi.extensibility.visual.IVisualHost,
  objectName: string,
  propertyName: string,
  filters: BasicValuesFilter[]
): void {
  if (!filters.length) {
    clearFilter(host, objectName, propertyName);
    return;
  }

  host.applyJsonFilter(
    filters as unknown as powerbi.IFilter,
    objectName,
    propertyName,
    powerbi.FilterAction.merge
  );
}

export function clearFilter(
  host: powerbi.extensibility.visual.IVisualHost,
  objectName: string,
  propertyName: string
): void {
  host.applyJsonFilter(
    null as unknown as powerbi.IFilter,
    objectName,
    propertyName,
    powerbi.FilterAction.remove
  );
}
