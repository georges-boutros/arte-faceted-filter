import * as React from "react";
import { SelectorProps } from "./types";

export const RadioSelector: React.FC<SelectorProps> = ({ facet, options, onChange }) => {
  const name = `ff-radio-${facet.index}`;
  return (
    <div className="ff-list">
      {options.map((option) => {
        const isSelected = facet.selectedKeys[0] === option.key;
        return (
          <label key={option.key} className={`ff-list__item ${isSelected ? "is-selected" : ""}`}>
            <input
              type="radio"
              name={name}
              checked={isSelected}
              onChange={() => onChange([option.key])}
            />
            <span className="ff-list__label">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
};
