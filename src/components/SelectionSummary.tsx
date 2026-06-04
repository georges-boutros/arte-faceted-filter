import * as React from "react";
import { FacetColumn } from "../models/Facet";
import { FacetStrings } from "../services/localizationService";

interface SelectionSummaryProps {
  facets: FacetColumn[];
  strings: FacetStrings;
  onFacetSelectionChange: (facetIndex: number, keys: string[]) => void;
  /**
   * When true, render every selected value as a single inline chip prefixed
   * by its facet title ("Category: Marketing ×"). Used for the footer where
   * vertical real estate is scarce. Defaults to grouped layout (label row +
   * chips beneath) for the standalone selection-only mode.
   */
  compact?: boolean;
}

/**
 * Compact, read-only view of the currently-selected values across every
 * visible facet. Each value renders as a chip with an "×" that removes
 * just that single value from its parent facet — the rest of the
 * selection is preserved.
 *
 * Intended for "selection only" display mode AND for the interactive
 * footer, where the user wants to drop individual values without opening
 * the corresponding facet's selector.
 */
export const SelectionSummary: React.FC<SelectionSummaryProps> = ({
  facets,
  strings,
  onFacetSelectionChange,
  compact = false
}) => {
  const facetsWithSelection = facets.filter((facet) => facet.selectedKeys.length > 0);

  if (facetsWithSelection.length === 0) {
    return <div className="ff-summary__empty">{strings.noActiveSelection}</div>;
  }

  const removeOne = (facet: FacetColumn, keyToRemove: string) => {
    const next = facet.selectedKeys.filter((key) => key !== keyToRemove);
    onFacetSelectionChange(facet.index, next);
  };

  const renderChip = (facet: FacetColumn, key: string, valueLabel: string, withPrefix: boolean) => (
    <span key={`${facet.queryName}::${key}`} className="ff-summary__chip">
      {withPrefix ? (
        <>
          <span className="ff-summary__chip-prefix">{facet.title}</span>
          <span className="ff-summary__chip-sep" aria-hidden="true">
            :
          </span>
        </>
      ) : null}
      <span className="ff-summary__chip-value">{valueLabel}</span>
      <button
        type="button"
        className="ff-summary__chip-remove"
        onClick={() => removeOne(facet, key)}
        aria-label={`${strings.removeValue} ${facet.title}: ${valueLabel}`}
        title={`${strings.removeValue} ${valueLabel}`}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path
            d="M2 2 L8 8 M8 2 L2 8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </span>
  );

  if (compact) {
    return (
      <div className="ff-summary ff-summary--compact">
        {facetsWithSelection.flatMap((facet) => {
          const labelByKey = new Map(facet.options.map((option) => [option.key, option.label]));
          return facet.selectedKeys.map((key) =>
            renderChip(facet, key, labelByKey.get(key) || key || "(blank)", true)
          );
        })}
      </div>
    );
  }

  return (
    <div className="ff-summary">
      {facetsWithSelection.map((facet) => {
        const labelByKey = new Map(facet.options.map((option) => [option.key, option.label]));
        return (
          <div key={facet.queryName} className="ff-summary__group">
            <span className="ff-summary__group-label">{facet.title}</span>
            <div className="ff-summary__chips">
              {facet.selectedKeys.map((key) =>
                renderChip(facet, key, labelByKey.get(key) || key || "(blank)", false)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
