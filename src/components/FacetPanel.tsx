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
  const isEmbeddedDropdown = embedTitleInDropdown && facet.selectorType === "dropdown";
  const showSearchBar = showSearch && facet.selectorType !== "toggle" && facet.options.length > 6;

  const handleSelectAll = () => {
    if (facet.selectionMode === "single") {
      return;
    }
    onSelectionChange(visibleOptions.map((option) => option.key));
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
          {facet.selectionMode === "multi" && facet.selectorType !== "toggle" ? (
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
