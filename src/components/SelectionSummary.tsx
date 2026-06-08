import * as React from "react";
import { FacetColumn } from "../models/Facet";
import { FacetStrings } from "../services/localizationService";

interface SelectionSummaryProps {
  facets: FacetColumn[];
  strings: FacetStrings;
  onFacetSelectionChange: (facetIndex: number, keys: string[]) => void;
  /**
   * When true, render every selected value as a single inline chip with no
   * facet-title prefix repeated on each chip — used for the footer where
   * vertical real estate is scarce. The facet title is shown once as a small
   * muted label before its group of chips.
   */
  compact?: boolean;
}

/** Beyond this many selected values for a single facet, fold the chips into a
 *  single "N selected ×" summary chip. Avoids drowning the user (and the
 *  layout) when a facet has dozens of values selected. */
const CHIP_FOLD_THRESHOLD = 6;

/**
 * Compact, read-only view of the currently-selected values across every
 * visible facet. Each value renders as a chip with an "×" that removes
 * just that single value from its parent facet — the rest of the
 * selection is preserved.
 *
 * Used for both:
 *   - selection-only display mode (compact = false): group label above,
 *     chips below.
 *   - the interactive footer (compact = true): label and chips inline on
 *     one row to save vertical space.
 *
 * In both layouts, a facet with more than CHIP_FOLD_THRESHOLD selected
 * values collapses to a single count chip ("12 selected ×") instead of
 * spamming dozens of individual chips. Clicking × on the count chip
 * clears every value from that facet at once.
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

  const clearFacet = (facet: FacetColumn) => {
    onFacetSelectionChange(facet.index, []);
  };

  const renderValueChip = (facet: FacetColumn, key: string, valueLabel: string) => (
    <span
      key={`${facet.queryName}::${key}`}
      className="ff-summary__chip"
      title={`${facet.title}: ${valueLabel}`}
    >
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

  const renderCountChip = (facet: FacetColumn) => (
    <span
      key={`${facet.queryName}::__count__`}
      className="ff-summary__chip ff-summary__chip--count"
      title={`${facet.title}: ${facet.selectedKeys.length} ${strings.selected}`}
    >
      <span className="ff-summary__chip-value">
        {facet.selectedKeys.length} {strings.selected}
      </span>
      <button
        type="button"
        className="ff-summary__chip-remove"
        onClick={() => clearFacet(facet)}
        aria-label={`${strings.clearSelection} ${facet.title}`}
        title={`${strings.clearSelection} ${facet.title}`}
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

  const renderFacetChips = (facet: FacetColumn) => {
    if (facet.selectedKeys.length > CHIP_FOLD_THRESHOLD) {
      return renderCountChip(facet);
    }
    const labelByKey = new Map(facet.options.map((option) => [option.key, option.label]));
    return facet.selectedKeys.map((key) =>
      renderValueChip(facet, key, labelByKey.get(key) || key || "(blank)")
    );
  };

  if (compact) {
    return (
      <div className="ff-summary ff-summary--compact">
        {facetsWithSelection.map((facet) => (
          <div key={facet.queryName} className="ff-summary__inline-group">
            <span className="ff-summary__inline-label">{facet.title}</span>
            {renderFacetChips(facet)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="ff-summary">
      {facetsWithSelection.map((facet) => (
        <div key={facet.queryName} className="ff-summary__group">
          <span className="ff-summary__group-label">{facet.title}</span>
          <div className="ff-summary__chips">{renderFacetChips(facet)}</div>
        </div>
      ))}
    </div>
  );
};
