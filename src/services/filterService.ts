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

export function applyBasicValuesFilter(
  host: powerbi.extensibility.visual.IVisualHost,
  objectName: string,
  propertyName: string,
  target: FilterColumnTarget,
  values: powerbi.PrimitiveValue[]
): void {
  if (!values.length) {
    clearFilter(host, objectName, propertyName);
    return;
  }

  const filter = createBasicValuesFilter(target, values);
  host.applyJsonFilter(filter as unknown as powerbi.IFilter, objectName, propertyName, powerbi.FilterAction.merge);
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
