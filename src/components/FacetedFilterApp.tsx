import * as React from "react";
import { ClearFilterIcon } from "../icons/ClearFilterIcon";
import { FacetColumn } from "../models/Facet";
import { buildAvailableKeysWithCascade } from "../services/cascadeService";
import { getFacetStrings } from "../services/localizationService";
import { ReportThemeContext, resolveTheme } from "../services/themeService";
import { VisualSettings } from "../settings";
import { FacetPanel } from "./FacetPanel";

interface FacetedFilterAppProps {
  settings: VisualSettings;
  facets: FacetColumn[];
  rows: Array<{ values: string[] }>;
  locale: string;
  viewportWidth: number;
  viewportHeight: number;
  reportTheme: ReportThemeContext;
  onFacetSelectionChange: (facetIndex: number, keys: string[]) => void;
  onResetAll: () => void;
}

export const FacetedFilterApp: React.FC<FacetedFilterAppProps> = ({
  settings,
  facets,
  rows,
  locale,
  viewportWidth,
  viewportHeight,
  reportTheme,
  onFacetSelectionChange,
  onResetAll
}) => {
  const strings = React.useMemo(() => getFacetStrings(locale), [locale]);
  const resolvedTheme = React.useMemo(() => resolveTheme(settings.style, reportTheme), [settings.style, reportTheme]);
  const themedStyle = React.useMemo(() => resolvedTheme.cssVariables as React.CSSProperties, [resolvedTheme.cssVariables]);

  const visibleFacets = React.useMemo(() => facets.filter((facet) => !facet.hidden), [facets]);

  const availableKeysByFacet = React.useMemo(
    () => buildAvailableKeysWithCascade(visibleFacets, rows, settings.layout.enableCascade),
    [visibleFacets, rows, settings.layout.enableCascade]
  );

  const orientation = React.useMemo<"horizontal" | "vertical">(() => {
    if (settings.layout.orientation === "horizontal") {
      return "horizontal";
    }
    if (settings.layout.orientation === "vertical") {
      return "vertical";
    }
    if (!viewportWidth || !viewportHeight) {
      return "horizontal";
    }
    return viewportHeight > viewportWidth ? "vertical" : "horizontal";
  }, [settings.layout.orientation, viewportWidth, viewportHeight]);

  const hasActiveSelection = visibleFacets.some((facet) => facet.selectedKeys.length > 0);
  const showTopBar = settings.general.showHeader || settings.general.showReset;
  const resolvedTitle = settings.general.titleText?.trim() ? settings.general.titleText : strings.title;
  const showFooter =
    settings.general.showFooter && (hasActiveSelection || settings.general.showNoFilterMessage);

  const footerLabel = React.useMemo(() => {
    if (!hasActiveSelection) {
      return strings.noSelection;
    }
    const parts: string[] = [];
    for (const facet of visibleFacets) {
      if (!facet.selectedKeys.length) {
        continue;
      }
      const selectedLabels = facet.selectedKeys.map(
        (key) => facet.options.find((option) => option.key === key)?.label || key || "(blank)"
      );
      if (selectedLabels.length <= 2) {
        parts.push(`${facet.title}: ${selectedLabels.join(", ")}`);
      } else {
        parts.push(`${facet.title}: ${selectedLabels.length} ${strings.selected}`);
      }
    }
    return parts.length ? parts.join(" • ") : strings.noSelection;
  }, [hasActiveSelection, visibleFacets, strings.noSelection, strings.selected]);

  const gridStyle: React.CSSProperties =
    orientation === "horizontal"
      ? {
          display: "grid",
          gridTemplateColumns: `repeat(auto-fit, minmax(${settings.layout.minFacetWidth}px, 1fr))`,
          gap: "var(--space-unit)"
        }
      : {
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-unit)"
        };

  return (
    <div
      className={`cds-root ff-root is-${orientation}`}
      data-theme={resolvedTheme.themeName}
      style={themedStyle}
    >
      {showTopBar ? (
        <div className={`cds-topbar ${!settings.general.showHeader ? "is-no-header" : ""}`}>
          {settings.general.showHeader ? <h2 className="cds-title">{resolvedTitle}</h2> : <span className="cds-title-spacer" />}
          {settings.general.showReset ? (
            <button
              className={`clear-filter-button ${hasActiveSelection ? "is-active" : ""}`}
              onClick={onResetAll}
              title={strings.clearFilter}
              aria-label={strings.clearFilter}
              type="button"
              disabled={!hasActiveSelection}
            >
              <ClearFilterIcon size={18} />
            </button>
          ) : null}
        </div>
      ) : null}

      <div className={`cds-card ff-card ${settings.general.showVisualFrame ? "" : "is-frame-hidden"}`}>
        {visibleFacets.length === 0 ? (
          <div className="ff-empty">
            {facets.length === 0 ? strings.noFieldsBound : strings.allFacetsHidden}
          </div>
        ) : (
          <div className="ff-grid" style={gridStyle}>
            {visibleFacets.map((facet) => (
              <FacetPanel
                key={facet.queryName}
                facet={facet}
                availableKeys={availableKeysByFacet.get(facet.index) || new Set()}
                showCount={settings.facetDefaults.showCount}
                showSearch={settings.general.showFacetSearch}
                embedTitleInDropdown={settings.general.embedTitleInDropdown}
                sortOrder={settings.facetDefaults.sortOrder}
                strings={strings}
                onSelectionChange={(keys) => onFacetSelectionChange(facet.index, keys)}
              />
            ))}
          </div>
        )}
      </div>

      {showFooter ? <div className="cds-footer ff-footer">{footerLabel}</div> : null}
    </div>
  );
};
