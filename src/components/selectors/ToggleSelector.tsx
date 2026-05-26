import * as React from "react";
import { SelectorProps } from "./types";

export const ToggleSelector: React.FC<SelectorProps> = ({ facet, options, strings, onChange }) => {
  if (options.length === 0) {
    return null;
  }

  return (
    <div className="ff-toggle" role="group">
      <button
        type="button"
        className={`ff-toggle__item ${facet.selectedKeys.length === 0 ? "is-selected" : ""}`}
        onClick={() => onChange([])}
      >
        {strings.allFacets}
      </button>
      {options.map((option) => {
        const isSelected = facet.selectedKeys[0] === option.key;
        return (
          <button
            key={option.key}
            type="button"
            className={`ff-toggle__item ${isSelected ? "is-selected" : ""}`}
            onClick={() => onChange(isSelected ? [] : [option.key])}
            title={option.label}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
