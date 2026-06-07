import powerbi from "powerbi-visuals-api";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { FacetedFilterApp } from "./components/FacetedFilterApp";
import { FacetColumn, FacetOption, SelectionMode, SelectorType } from "./models/Facet";
import {
  applyAllFacetFilters,
  BasicValuesFilter,
  clearFilter,
  createBasicValuesFilter,
  FilterColumnTarget,
  parseQueryNameToTarget
} from "./services/filterService";
import { resolveVisualLocale } from "./services/localizationService";
import { ReportThemeContext } from "./services/themeService";
import { VisualSettings } from "./settings";
import "./styles/visual.css";

import DataView = powerbi.DataView;
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;

const FILTER_OBJECT_NAME = "general";
const FILTER_PROPERTY_NAME = "filter";
const MAX_FACETS = 8;

export class Visual implements IVisual {
  private readonly host: powerbi.extensibility.visual.IVisualHost;
  private readonly root: Root;

  private settings: VisualSettings = new VisualSettings();
  private facets: FacetColumn[] = [];
  private targets: Map<number, FilterColumnTarget> = new Map();
  private rows: Array<{ values: string[] }> = [];
  private metadataColumns: powerbi.DataViewMetadataColumn[] = [];
  private locale = "en-US";
  private viewportWidth = 0;
  private viewportHeight = 0;
  private reportTheme: ReportThemeContext = {};
  /**
   * Last-observed external filter signature per facet (keyed by queryName).
   * We only resync a facet's selection from external state when its signature
   * actually changes — otherwise we trust the in-memory state carried over by
   * `buildFacetsFromDataView`. Without this, every Power BI `update()` after a
   * user click would race-overwrite the selection with a stale empty filter,
   * which is what caused the "I have to click several times" UX bug.
   */
  private externalSignatures: Map<string, string> = new Map();

  constructor(options?: VisualConstructorOptions) {
    if (!options) {
      throw new Error("Visual constructor options are required.");
    }

    this.host = options.host;
    this.locale = resolveVisualLocale(this.host.locale);
    this.root = createRoot(options.element);
  }

  public update(options: VisualUpdateOptions): void {
    const dataView = options.dataViews?.[0];
    if (!dataView) {
      this.facets = [];
      this.rows = [];
      this.render();
      return;
    }

    this.settings = VisualSettings.parse(dataView);
    this.viewportWidth = options.viewport?.width || 0;
    this.viewportHeight = options.viewport?.height || 0;
    this.locale = resolveVisualLocale(this.host.locale);
    this.reportTheme = this.extractReportTheme();

    const { facets, rows, metadataColumns, targets } = this.buildFacetsFromDataView(dataView);
    this.targets = targets;
    this.rows = rows;
    this.metadataColumns = metadataColumns;
    this.facets = this.mergeExternalSelectionState(facets, options, dataView);

    this.render();
  }

  public destroy(): void {
    try {
      this.root.unmount();
    } catch {
      // noop
    }
  }

  public enumerateObjectInstances(
    options: EnumerateVisualObjectInstancesOptions
  ): VisualObjectInstanceEnumeration {
    return VisualSettings.enumerateObjectInstances(this.settings, options, this.metadataColumns);
  }

  private buildFacetsFromDataView(dataView: DataView): {
    facets: FacetColumn[];
    rows: Array<{ values: string[] }>;
    metadataColumns: powerbi.DataViewMetadataColumn[];
    targets: Map<number, FilterColumnTarget>;
  } {
    const categories = dataView.categorical?.categories || [];
    const limited = categories.slice(0, MAX_FACETS);
    const metadataColumns = limited.map((c) => c.source);
    const targets = new Map<number, FilterColumnTarget>();
    const rowCount = limited[0]?.values?.length || 0;

    // Carry over the in-memory selection from the previous update() so a
    // user's click sticks even if the very next Power BI update() arrives
    // before our `applyJsonFilter` has been persisted into jsonFilters or
    // metadata.objects.
    const previousSelectionsByQuery = new Map<string, string[]>(
      this.facets.map((facet) => [facet.queryName, facet.selectedKeys])
    );

    const facets: FacetColumn[] = limited.map((category, index) => {
      const override = VisualSettings.parsePerFacetOverride(category.source);
      const target = parseQueryNameToTarget(category.source.queryName);
      if (target) {
        targets.set(index, target);
      }

      const optionMap = new Map<string, FacetOption>();
      for (const rawValue of category.values) {
        const key = toKey(rawValue);
        if (!optionMap.has(key)) {
          optionMap.set(key, {
            key,
            label: toLabel(rawValue),
            // Normalize blanks to null so Power BI can correctly filter on blank
            // values (e.g. column IS BLANK). Preserve other primitive types as-is.
            rawValue: (rawValue === undefined ? null : rawValue) as powerbi.PrimitiveValue
          });
        }
      }

      const selectorType: SelectorType =
        override.selectorType && override.selectorType !== "default"
          ? override.selectorType
          : this.settings.facetDefaults.selectorType;

      const requestedMode: SelectionMode =
        override.selectionMode && override.selectionMode !== "default"
          ? override.selectionMode
          : this.settings.facetDefaults.selectionMode;

      const selectionMode: SelectionMode = forceSelectionModeBySelector(selectorType, requestedMode);

      const title = (override.facetTitle && override.facetTitle.trim()) || category.source.displayName || `Facet ${index + 1}`;

      const queryName = category.source.queryName || `facet_${index}`;
      const carriedKeys = (previousSelectionsByQuery.get(queryName) || []).filter((key) =>
        optionMap.has(key)
      );
      const enforcedKeys = selectionMode === "single" ? carriedKeys.slice(0, 1) : carriedKeys;

      return {
        index,
        queryName,
        displayName: category.source.displayName || `Facet ${index + 1}`,
        title,
        selectorType,
        selectionMode,
        hidden: !!override.hidden,
        options: Array.from(optionMap.values()),
        availableKeys: new Set(optionMap.keys()),
        selectedKeys: enforcedKeys
      };
    });

    const rows: Array<{ values: string[] }> = [];
    for (let i = 0; i < rowCount; i += 1) {
      const values: string[] = [];
      for (let j = 0; j < limited.length; j += 1) {
        values.push(toKey(limited[j].values[i]));
      }
      rows.push({ values });
    }

    return { facets, rows, metadataColumns, targets };
  }

  private mergeExternalSelectionState(
    facets: FacetColumn[],
    options: VisualUpdateOptions,
    dataView: DataView
  ): FacetColumn[] {
    const externalSelections = this.extractExternalSelections(options, dataView, facets);

    return facets.map((facet) => {
      const persisted = externalSelections.get(facet.index);
      const externalSig = this.signatureFromKeys(persisted);
      const lastSig = this.externalSignatures.get(facet.queryName);

      // Signature unchanged → external state didn't actually change. Keep the
      // selection we just carried over from the previous in-memory state so
      // the user's most recent click sticks even if Power BI's persistence is
      // a tick late.
      if (lastSig === externalSig) {
        return facet;
      }

      this.externalSignatures.set(facet.queryName, externalSig);

      if (!persisted || persisted.length === 0) {
        // External cleared the filter — honor it.
        return { ...facet, selectedKeys: [] };
      }

      const validKeys = persisted.filter((key) => facet.availableKeys.has(key));
      const finalKeys = facet.selectionMode === "single" ? validKeys.slice(0, 1) : validKeys;
      return { ...facet, selectedKeys: finalKeys };
    });
  }

  private signatureFromKeys(keys: string[] | undefined): string {
    if (!keys || keys.length === 0) {
      return "none";
    }
    return `vals:${[...keys].sort().join("|")}`;
  }

  private extractExternalSelections(
    options: VisualUpdateOptions,
    dataView: DataView,
    facets: FacetColumn[]
  ): Map<number, string[]> {
    const result = new Map<number, string[]>();
    const objects = dataView.metadata?.objects as Record<string, unknown> | undefined;
    const generalObject = objects?.[FILTER_OBJECT_NAME] as Record<string, unknown> | undefined;

    const allCandidates: unknown[] = [];
    if (options.jsonFilters && Array.isArray(options.jsonFilters)) {
      allCandidates.push(...options.jsonFilters);
    }
    if (generalObject) {
      const raw = generalObject[FILTER_PROPERTY_NAME];
      if (Array.isArray(raw)) {
        allCandidates.push(...raw);
      } else if (raw) {
        allCandidates.push(raw);
      }
    }

    for (const candidate of allCandidates) {
      const parsed = this.parseExternalFilterCandidate(candidate);
      if (!parsed) {
        continue;
      }
      const facetIndex = facets.findIndex((facet) => {
        const target = this.targets.get(facet.index);
        return target && target.table === parsed.target.table && target.column === parsed.target.column;
      });
      if (facetIndex >= 0 && !result.has(facets[facetIndex].index)) {
        result.set(facets[facetIndex].index, parsed.keys);
      }
    }

    return result;
  }

  private parseExternalFilterCandidate(
    candidate: unknown
  ): { target: FilterColumnTarget; keys: string[] } | null {
    if (!candidate || typeof candidate !== "object") {
      return null;
    }
    const filter = candidate as Record<string, unknown>;
    const rawTarget = filter.target as Record<string, unknown> | undefined;
    if (!rawTarget || typeof rawTarget.table !== "string" || typeof rawTarget.column !== "string") {
      return null;
    }
    // Accept only basic IN filters (filterType 1). Reject NotIn / All / unknown
    // operators so we never silently treat an exclusion as an inclusion.
    const hasBasicShape = filter.filterType === 1 || filter.$schema === "https://powerbi.com/product/schema#basic";
    if (!hasBasicShape) {
      return null;
    }
    if (filter.operator !== undefined && filter.operator !== "In") {
      return null;
    }
    const values = filter.values;
    if (!Array.isArray(values)) {
      return null;
    }
    return {
      target: { table: rawTarget.table, column: rawTarget.column },
      keys: values.map((v) => toKey(v as powerbi.PrimitiveValue))
    };
  }

  /**
   * Build the IFilter array for every facet that has at least one selected
   * value, then apply (or clear) them all in a single host.applyJsonFilter
   * call. This is the only way Power BI reliably cross-filters the rest of
   * the report from a single visual — storing each facet in a different
   * filter property only honoured the first slot.
   */
  private applyAllFilters(): void {
    const filters: BasicValuesFilter[] = [];
    for (const facet of this.facets) {
      const target = this.targets.get(facet.index);
      if (!target || facet.selectedKeys.length === 0) {
        continue;
      }
      const rawValues = facet.selectedKeys.map((key) => {
        const option = facet.options.find((o) => o.key === key);
        return option ? option.rawValue : (key as powerbi.PrimitiveValue);
      });
      filters.push(createBasicValuesFilter(target, rawValues));
    }

    applyAllFacetFilters(this.host, FILTER_OBJECT_NAME, FILTER_PROPERTY_NAME, filters);
  }

  private onFacetSelectionChange = (facetIndex: number, nextKeys: string[]): void => {
    const targetFacet = this.facets.find((facet) => facet.index === facetIndex);
    if (!targetFacet) {
      return;
    }

    const uniqueKeys = Array.from(new Set(nextKeys));
    const normalizedKeys =
      targetFacet.selectionMode === "single" ? uniqueKeys.slice(-1) : uniqueKeys;

    this.facets = this.facets.map((facet) =>
      facet.index === facetIndex ? { ...facet, selectedKeys: normalizedKeys } : facet
    );

    this.applyAllFilters();
    this.render();
  };

  private onResetAll = (): void => {
    this.facets = this.facets.map((facet) => ({ ...facet, selectedKeys: [] }));
    clearFilter(this.host, FILTER_OBJECT_NAME, FILTER_PROPERTY_NAME);
    this.render();
  };

  private extractReportTheme(): ReportThemeContext {
    const palette = this.host.colorPalette as powerbi.extensibility.ISandboxExtendedColorPalette | undefined;
    if (!palette) {
      return {};
    }

    const getColorValue = (key: keyof powerbi.extensibility.ISandboxExtendedColorPalette): string | undefined => {
      const value = palette[key];
      if (value && typeof value === "object" && "value" in value) {
        return (value as powerbi.IColorInfo).value;
      }
      return undefined;
    };

    return {
      backgroundColor: getColorValue("background") || getColorValue("backgroundNeutral"),
      foregroundColor: getColorValue("foreground"),
      accentColor: getColorValue("hyperlink"),
      isHighContrast: !!palette.isHighContrast
    };
  }

  private render(): void {
    this.root.render(
      React.createElement(FacetedFilterApp, {
        settings: this.settings,
        facets: this.facets,
        rows: this.rows,
        locale: this.locale,
        viewportWidth: this.viewportWidth,
        viewportHeight: this.viewportHeight,
        reportTheme: this.reportTheme,
        onFacetSelectionChange: this.onFacetSelectionChange,
        onResetAll: this.onResetAll
      })
    );
  }
}

function toKey(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return String(value);
}

function toLabel(value: unknown): string {
  if (value === null || value === undefined) {
    return "(blank)";
  }
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  return String(value);
}

function forceSelectionModeBySelector(selectorType: SelectorType, requested: SelectionMode): SelectionMode {
  if (selectorType === "radio" || selectorType === "toggle") {
    return "single";
  }
  // dropdown, typeahead, checkbox, chips, list all support both modes.
  return requested;
}
