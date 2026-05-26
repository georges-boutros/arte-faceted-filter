import powerbi from "powerbi-visuals-api";
import { FacetSortOrder, SelectionMode, SelectorType } from "./models/Facet";

export class GeneralSettings {
  public showHeader = true;
  public titleText = "";
  public showNoFilterMessage = true;
  public showVisualFrame = true;
  public showReset = true;
  public showFooter = true;
  public showFacetSearch = true;
  public embedTitleInDropdown = true;
}

export class LayoutSettings {
  public orientation: "auto" | "horizontal" | "vertical" = "auto";
  public enableCascade = true;
  public minFacetWidth = 220;
}

export class FacetDefaultsSettings {
  public selectorType: SelectorType = "checkbox";
  public selectionMode: SelectionMode = "multi";
  public sortOrder: FacetSortOrder = "asc";
  public showCount = true;
}

export class StyleSettings {
  public themeMode: "auto" | "light" | "dark" | "custom" = "auto";
  public visualBackground = "#ffffff";
  public panelBackground = "#ffffff";
  public surfaceBackground = "#fafafa";
  public borderColor = "#e5e7eb";
  public dividerColor = "#eef0f3";

  public textPrimaryColor = "#1f2328";
  public textSecondaryColor = "#6b7280";
  public placeholderColor = "#9aa0a6";

  public accentColor = "#2f6feb";
  public accentHoverColor = "#1f4fc4";
  public selectedBackgroundColor = "#e7eef8";
  public selectedTextColor = "#1f2328";
  public focusBorderColor = "#c9d3e2";

  public inputBackground = "#ffffff";
  public inputBorder = "#e5e7eb";
  public inputTextColor = "#1f2328";
  public dropdownBackground = "#ffffff";
  public dropdownBorder = "#e5e7eb";

  public buttonBackground = "transparent";
  public buttonBorder = "#e5e7eb";
  public buttonText = "#1f2328";
  public iconColor = "#6b7280";

  public hoverBackgroundColor = "#f4f5f7";
  public disabledBackgroundColor = "#f4f5f7";
  public disabledTextColor = "#b3b7be";
  public shadowColor = "rgba(15, 23, 42, 0.08)";

  public borderRadius = 8;
  public fontSize = 12;
  public compactDensity = 0;
  public shadowEnabled = true;
  public cellSpacing = 4;
}

export interface PerFacetOptionOverride {
  selectorType?: SelectorType | "default";
  selectionMode?: SelectionMode | "default";
  facetTitle?: string;
  hidden?: boolean;
}

export class VisualSettings {
  public general: GeneralSettings = new GeneralSettings();
  public layout: LayoutSettings = new LayoutSettings();
  public facetDefaults: FacetDefaultsSettings = new FacetDefaultsSettings();
  public style: StyleSettings = new StyleSettings();

  public static parse(dataView: powerbi.DataView | undefined): VisualSettings {
    const settings = new VisualSettings();
    const objects = dataView?.metadata?.objects;

    settings.general.showHeader = getValue<boolean>(objects, "general", "showHeader", settings.general.showHeader);
    settings.general.titleText = getValue<string>(objects, "general", "titleText", settings.general.titleText);
    settings.general.showNoFilterMessage = getValue<boolean>(
      objects,
      "general",
      "showNoFilterMessage",
      settings.general.showNoFilterMessage
    );
    settings.general.showVisualFrame = getValue<boolean>(
      objects,
      "general",
      "showVisualFrame",
      settings.general.showVisualFrame
    );
    settings.general.showReset = getValue<boolean>(objects, "general", "showReset", settings.general.showReset);
    settings.general.showFooter = getValue<boolean>(objects, "general", "showFooter", settings.general.showFooter);
    settings.general.showFacetSearch = getValue<boolean>(
      objects,
      "general",
      "showFacetSearch",
      settings.general.showFacetSearch
    );
    settings.general.embedTitleInDropdown = getValue<boolean>(
      objects,
      "general",
      "embedTitleInDropdown",
      settings.general.embedTitleInDropdown
    );

    settings.layout.orientation = getOrientation(
      getValue<string>(objects, "layout", "orientation", settings.layout.orientation)
    );
    settings.layout.enableCascade = getValue<boolean>(objects, "layout", "enableCascade", settings.layout.enableCascade);
    settings.layout.minFacetWidth = clamp(
      getValue<number>(objects, "layout", "minFacetWidth", settings.layout.minFacetWidth),
      120,
      600
    );

    settings.facetDefaults.selectorType = getSelectorType(
      getValue<string>(objects, "facetDefaults", "selectorType", settings.facetDefaults.selectorType)
    );
    settings.facetDefaults.selectionMode = getSelectionMode(
      getValue<string>(objects, "facetDefaults", "selectionMode", settings.facetDefaults.selectionMode)
    );
    settings.facetDefaults.sortOrder = getSortOrder(
      getValue<string>(objects, "facetDefaults", "sortOrder", settings.facetDefaults.sortOrder)
    );
    settings.facetDefaults.showCount = getValue<boolean>(
      objects,
      "facetDefaults",
      "showCount",
      settings.facetDefaults.showCount
    );

    settings.style.visualBackground = getColor(objects, "style", "visualBackground", settings.style.visualBackground);
    settings.style.panelBackground = getColor(objects, "style", "panelBackground", settings.style.panelBackground);
    settings.style.surfaceBackground = getColor(objects, "style", "surfaceBackground", settings.style.surfaceBackground);
    settings.style.borderColor = getColor(objects, "style", "borderColor", settings.style.borderColor);
    settings.style.dividerColor = getColor(objects, "style", "dividerColor", settings.style.dividerColor);
    settings.style.textPrimaryColor = getColor(objects, "style", "textPrimaryColor", settings.style.textPrimaryColor);
    settings.style.textSecondaryColor = getColor(
      objects,
      "style",
      "textSecondaryColor",
      settings.style.textSecondaryColor
    );
    settings.style.placeholderColor = getColor(objects, "style", "placeholderColor", settings.style.placeholderColor);
    settings.style.accentColor = getColor(objects, "style", "accentColor", settings.style.accentColor);
    settings.style.accentHoverColor = getColor(objects, "style", "accentHoverColor", settings.style.accentHoverColor);
    settings.style.selectedBackgroundColor = getColor(
      objects,
      "style",
      "selectedBackgroundColor",
      settings.style.selectedBackgroundColor
    );
    settings.style.selectedTextColor = getColor(objects, "style", "selectedTextColor", settings.style.selectedTextColor);
    settings.style.focusBorderColor = getColor(objects, "style", "focusBorderColor", settings.style.focusBorderColor);
    settings.style.inputBackground = getColor(objects, "style", "inputBackground", settings.style.inputBackground);
    settings.style.inputBorder = getColor(objects, "style", "inputBorder", settings.style.inputBorder);
    settings.style.inputTextColor = getColor(objects, "style", "inputTextColor", settings.style.inputTextColor);
    settings.style.dropdownBackground = getColor(
      objects,
      "style",
      "dropdownBackground",
      settings.style.dropdownBackground
    );
    settings.style.dropdownBorder = getColor(objects, "style", "dropdownBorder", settings.style.dropdownBorder);
    settings.style.buttonBackground = getColor(objects, "style", "buttonBackground", settings.style.buttonBackground);
    settings.style.buttonBorder = getColor(objects, "style", "buttonBorder", settings.style.buttonBorder);
    settings.style.buttonText = getColor(objects, "style", "buttonText", settings.style.buttonText);
    settings.style.iconColor = getColor(objects, "style", "iconColor", settings.style.iconColor);
    settings.style.hoverBackgroundColor = getColor(
      objects,
      "style",
      "hoverBackgroundColor",
      settings.style.hoverBackgroundColor
    );
    settings.style.disabledBackgroundColor = getColor(
      objects,
      "style",
      "disabledBackgroundColor",
      settings.style.disabledBackgroundColor
    );
    settings.style.disabledTextColor = getColor(objects, "style", "disabledTextColor", settings.style.disabledTextColor);
    settings.style.shadowColor = getColor(objects, "style", "shadowColor", settings.style.shadowColor);

    settings.style.themeMode = getThemeMode(getValue<string>(objects, "style", "themeMode", settings.style.themeMode));
    settings.style.borderRadius = clamp(
      getValue<number>(objects, "style", "borderRadius", settings.style.borderRadius),
      0,
      36
    );
    settings.style.fontSize = clamp(getValue<number>(objects, "style", "fontSize", settings.style.fontSize), 10, 24);
    settings.style.compactDensity = clamp(
      getValue<number>(objects, "style", "compactDensity", settings.style.compactDensity),
      0,
      3
    );
    settings.style.shadowEnabled = getValue<boolean>(objects, "style", "shadowEnabled", settings.style.shadowEnabled);
    settings.style.cellSpacing = clamp(
      getValue<number>(objects, "style", "cellSpacing", settings.style.cellSpacing),
      0,
      14
    );

    return settings;
  }

  public static parsePerFacetOverride(column: powerbi.DataViewMetadataColumn | undefined): PerFacetOptionOverride {
    if (!column?.objects) {
      return {};
    }
    const facetOptions = (column.objects as Record<string, unknown>)["facetOptions"] as
      | Record<string, unknown>
      | undefined;
    if (!facetOptions) {
      return {};
    }

    return {
      selectorType: facetOptions.selectorType as SelectorType | "default" | undefined,
      selectionMode: facetOptions.selectionMode as SelectionMode | "default" | undefined,
      facetTitle: facetOptions.facetTitle as string | undefined,
      hidden: facetOptions.hidden as boolean | undefined
    };
  }

  public static enumerateObjectInstances(
    settings: VisualSettings,
    options: powerbi.EnumerateVisualObjectInstancesOptions,
    facetColumns: powerbi.DataViewMetadataColumn[]
  ): powerbi.VisualObjectInstance[] {
    const objectName = options.objectName;

    switch (objectName) {
      case "general":
        return [
          {
            objectName,
            selector: null as unknown as never,
            properties: {
              showHeader: settings.general.showHeader,
              titleText: settings.general.titleText,
              showNoFilterMessage: settings.general.showNoFilterMessage,
              showVisualFrame: settings.general.showVisualFrame,
              showReset: settings.general.showReset,
              showFooter: settings.general.showFooter,
              showFacetSearch: settings.general.showFacetSearch,
              embedTitleInDropdown: settings.general.embedTitleInDropdown
            }
          }
        ];

      case "layout":
        return [
          {
            objectName,
            selector: null as unknown as never,
            properties: {
              orientation: settings.layout.orientation,
              enableCascade: settings.layout.enableCascade,
              minFacetWidth: settings.layout.minFacetWidth
            }
          }
        ];

      case "facetDefaults":
        return [
          {
            objectName,
            selector: null as unknown as never,
            properties: {
              selectorType: settings.facetDefaults.selectorType,
              selectionMode: settings.facetDefaults.selectionMode,
              sortOrder: settings.facetDefaults.sortOrder,
              showCount: settings.facetDefaults.showCount
            }
          }
        ];

      case "facetOptions":
        return facetColumns.map((column) => {
          const override = VisualSettings.parsePerFacetOverride(column);
          return {
            objectName,
            selector: { metadata: column.queryName } as unknown as never,
            displayName: column.displayName,
            properties: {
              selectorType: override.selectorType || "default",
              selectionMode: override.selectionMode || "default",
              facetTitle: override.facetTitle || "",
              hidden: !!override.hidden
            }
          };
        });

      case "style":
        return [
          {
            objectName,
            selector: null as unknown as never,
            properties: {
              visualBackground: { solid: { color: settings.style.visualBackground } },
              panelBackground: { solid: { color: settings.style.panelBackground } },
              surfaceBackground: { solid: { color: settings.style.surfaceBackground } },
              borderColor: { solid: { color: settings.style.borderColor } },
              dividerColor: { solid: { color: settings.style.dividerColor } },
              textPrimaryColor: { solid: { color: settings.style.textPrimaryColor } },
              textSecondaryColor: { solid: { color: settings.style.textSecondaryColor } },
              placeholderColor: { solid: { color: settings.style.placeholderColor } },
              accentColor: { solid: { color: settings.style.accentColor } },
              accentHoverColor: { solid: { color: settings.style.accentHoverColor } },
              selectedBackgroundColor: { solid: { color: settings.style.selectedBackgroundColor } },
              selectedTextColor: { solid: { color: settings.style.selectedTextColor } },
              focusBorderColor: { solid: { color: settings.style.focusBorderColor } },
              inputBackground: { solid: { color: settings.style.inputBackground } },
              inputBorder: { solid: { color: settings.style.inputBorder } },
              inputTextColor: { solid: { color: settings.style.inputTextColor } },
              dropdownBackground: { solid: { color: settings.style.dropdownBackground } },
              dropdownBorder: { solid: { color: settings.style.dropdownBorder } },
              buttonBackground: { solid: { color: settings.style.buttonBackground } },
              buttonBorder: { solid: { color: settings.style.buttonBorder } },
              buttonText: { solid: { color: settings.style.buttonText } },
              iconColor: { solid: { color: settings.style.iconColor } },
              hoverBackgroundColor: { solid: { color: settings.style.hoverBackgroundColor } },
              disabledBackgroundColor: { solid: { color: settings.style.disabledBackgroundColor } },
              disabledTextColor: { solid: { color: settings.style.disabledTextColor } },
              shadowColor: { solid: { color: settings.style.shadowColor } },
              themeMode: settings.style.themeMode,
              borderRadius: settings.style.borderRadius,
              fontSize: settings.style.fontSize,
              compactDensity: settings.style.compactDensity,
              shadowEnabled: settings.style.shadowEnabled,
              cellSpacing: settings.style.cellSpacing
            }
          }
        ];

      default:
        return [];
    }
  }
}

function getThemeMode(value: string): "auto" | "light" | "dark" | "custom" {
  switch (value) {
    case "light":
    case "dark":
    case "custom":
    case "auto":
      return value;
    default:
      return "auto";
  }
}

function getOrientation(value: string): "auto" | "horizontal" | "vertical" {
  switch (value) {
    case "horizontal":
    case "vertical":
    case "auto":
      return value;
    default:
      return "auto";
  }
}

function getSelectorType(value: string): SelectorType {
  switch (value) {
    case "dropdown":
    case "chips":
    case "toggle":
    case "list":
    case "radio":
    case "checkbox":
      return value;
    default:
      return "checkbox";
  }
}

function getSelectionMode(value: string): SelectionMode {
  return value === "single" ? "single" : "multi";
}

function getSortOrder(value: string): FacetSortOrder {
  switch (value) {
    case "asc":
    case "desc":
    case "data":
      return value;
    default:
      return "asc";
  }
}

function getValue<T>(
  objects: powerbi.DataViewObjects | undefined,
  objectName: string,
  propertyName: string,
  defaultValue: T
): T {
  const typedObjects = objects as Record<string, unknown> | undefined;
  const object = typedObjects?.[objectName] as Record<string, unknown> | undefined;
  const value = object?.[propertyName];
  return value === undefined || value === null ? defaultValue : (value as T);
}

function getColor(
  objects: powerbi.DataViewObjects | undefined,
  objectName: string,
  propertyName: string,
  defaultColor: string
): string {
  const typedObjects = objects as Record<string, unknown> | undefined;
  const object = typedObjects?.[objectName] as Record<string, unknown> | undefined;
  const fill = object?.[propertyName] as { solid?: { color?: string } } | undefined;
  return fill?.solid?.color || defaultColor;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.max(min, Math.min(max, value));
}
