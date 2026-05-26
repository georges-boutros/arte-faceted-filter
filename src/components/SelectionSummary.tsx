import * as React from "react";
import { FacetColumn } from "../models/Facet";
import { FacetStrings } from "../services/localizationService";

interface SelectionSummaryProps {
  facets: FacetColumn[];
  strings: FacetStrings;
  onFacetSelectionChange: (facetIndex: number, keys: string[]) => void;
}

/**
 * Compact, read-only view of the currently-selected values across every
 * visible facet. Each value renders as a chip with an "×" that removes
 * just that single value from its parent facet — the rest of the
 * selection is preserved.
 *
 * Intended for "selection only" display mode, where filters are placed
 * elsewhere in the report and this visual acts as a removable-tags summary.
 */
export const SelectionSummary: React.FC<SelectionSummaryProps> = ({
  facets,
  strings,
  onFacetSelectionChange
}) => {
  const facetsWithSelection = facets.filter((facet) => facet.selectedKeys.length > 0);

  if (facetsWithSelection.length === 0) {
    return <div className="ff-summary__empty">{strings.noActiveSelection}</div>;
  }

  const removeOne = (facet: FacetColumn, keyToRemove: string) => {
    const next = facet.selectedKeys.filter((key) => key !== keyToRemove);
    onFacetSelectionChange(facet.index, next);
  };

  return (
    <div className="ff-summary">
      {facetsWithSelection.map((facet) => {
        const labelByKey = new Map(facet.options.map((option) => [option.key, option.label]));
        return (
          <div key={facet.queryName} className="ff-summary__group">
            <span className="ff-summary__group-label">{facet.title}</span>
            <div className="ff-summary__chips">
              {facet.selectedKeys.map((key) => {
                const valueLabel = labelByKey.get(key) || key || "(blank)";
                return (
                  <span key={key} className="ff-summary__chip">
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
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
