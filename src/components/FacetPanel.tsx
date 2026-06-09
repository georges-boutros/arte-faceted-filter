import * as React from "react";
import { FacetColumn, FacetSortOrder } from "../models/Facet";
import { sortAndFilterOptions } from "../services/cascadeService";
import { FacetStrings } from "../services/localizationService";
import { CheckboxSelector } from "./selectors/CheckboxSelector";
import { ChipsSelector } from "./selectors/ChipsSelector";
import { DropdownSelector } from "./selectors/DropdownSelector";
import { ListSelector } from "./selectors/ListSelector";
import { RadioSelector } from "./selectors/RadioSelector";
import { ToggleSelector } from "./selectors/ToggleSelector";
import { TypeaheadSelector } from "./selectors/TypeaheadSelector";

interface FacetPanelProps {
  facet: FacetColumn;
  availableKeys: Set<string>;
  showCount: boolean;
  showSearch: boolean;
  embedTitleInDropdown: boolean;
  sortOrder: FacetSortOrder;
  strings: FacetStrings;
  onSelectionChange: (keys: string[]) => void;
}

export const FacetPanel: React.FC<FacetPanelProps> = ({
  facet,
  availableKeys,
  showCount,
  showSearch,
  embedTitleInDropdown,
  sortOrder,
  strings,
  onSelectionChange
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const visibleOptions = React.useMemo(
    () => sortAndFilterOptions(facet.options, availableKeys, searchTerm, sortOrder),
    [facet.options, availableKeys, searchTerm, sortOrder]
  );

  const selectionCount = facet.selectedKeys.length;
  // Both dropdown and typeahead can absorb the facet title into their own
  // affordances (Lovable-style label, search placeholder respectively).
  const isEmbeddedDropdown =
    embedTitleInDropdown && (facet.selectorType === "dropdown" || facet.selectorType === "typeahead");
  // Typeahead and toggle carry their own affordances; don't double up with the
  // facet-level search input.
  const showSearchBar =
    showSearch &&
    facet.selectorType !== "toggle" &&
    facet.selectorType !== "typeahead" &&
    facet.options.length > 6;
  // Select-all / Clear-all helpers only make sense for selectors that show
  // the whole option list inline. Dropdown and typeahead manage their own
  // pick + remove flow (checkboxes inside the panel, × on each chip);
  // doubling up the header actions just adds noise.
  const showHeaderActions =
    facet.selectionMode === "multi" &&
    (facet.selectorType === "checkbox" ||
      facet.selectorType === "chips" ||
      facet.selectorType === "list");

  const handleSelectAll = () => {
    if (facet.selectionMode === "single") {
      return;
    }
    // Additive semantics: union the currently visible matches with whatever
    // was selected before. Without this, doing "search be → Select all → search
    // ze → Select all" would wipe the be entries because Select all replaced
    // the whole selection with the new match set.
    const union = new Set<string>(facet.selectedKeys);
    for (const option of visibleOptions) {
      union.add(option.key);
    }
    onSelectionChange(Array.from(union));
  };

  const handleClear = () => {
    onSelectionChange([]);
  };

  const renderSelector = () => {
    const commonProps = {
      facet,
      options: visibleOptions,
      onChange: onSelectionChange,
      strings
    };

    switch (facet.selectorType) {
      case "dropdown":
        return (
          <DropdownSelector
            {...commonProps}
            embeddedTitle={isEmbeddedDropdown ? facet.title : undefined}
          />
        );
      case "typeahead":
        return (
          <TypeaheadSelector
            {...commonProps}
            embeddedTitle={embedTitleInDropdown ? facet.title : undefined}
          />
        );
      case "chips":
        return <ChipsSelector {...commonProps} />;
      case "toggle":
        return <ToggleSelector {...commonProps} />;
      case "list":
        return <ListSelector {...commonProps} />;
      case "radio":
        return <RadioSelector {...commonProps} />;
      case "checkbox":
      default:
        return <CheckboxSelector {...commonProps} />;
    }
  };

  return (
    <div
      className={`ff-facet ${isEmbeddedDropdown ? "is-embedded" : ""}`}
      data-selector={facet.selectorType}
    >
      {isEmbeddedDropdown ? null : (
        <div className="ff-facet__head">
          <div className="ff-facet__title">
            <span className="ff-facet__title-text">{facet.title}</span>
            {showCount && selectionCount > 0 ? (
              <span className="ff-facet__count">{selectionCount}</span>
            ) : null}
          </div>
          {showHeaderActions ? (
            <div className="ff-facet__actions">
              {visibleOptions.length > 0 ? (
                <button
                  className="cds-chip cds-chip--ghost ff-facet__action"
                  type="button"
                  onClick={handleSelectAll}
                >
                  {strings.selectAll}
                </button>
              ) : null}
              {selectionCount > 0 ? (
                <button
                  className="cds-chip cds-chip--ghost ff-facet__action"
                  type="button"
                  onClick={handleClear}
                >
                  {strings.clearSelection}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      )}

      {showSearchBar && !isEmbeddedDropdown ? (
        <input
          type="search"
          className="ff-facet__search cds-date-selector__search"
          placeholder={strings.search}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      ) : null}

      {visibleOptions.length === 0 && !isEmbeddedDropdown ? (
        <div className="ff-facet__empty">{strings.noOptions}</div>
      ) : (
        <div className="ff-facet__body">{renderSelector()}</div>
      )}
    </div>
  );
};
