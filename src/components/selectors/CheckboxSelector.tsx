import * as React from "react";
import { SelectorProps } from "./types";

export const CheckboxSelector: React.FC<SelectorProps> = ({ facet, options, onChange }) => {
  const toggle = (key: string, checked: boolean) => {
    const set = new Set(facet.selectedKeys);
    if (checked) {
      set.add(key);
    } else {
      set.delete(key);
    }
    onChange(Array.from(set));
  };

  return (
    <div className="ff-list">
      {options.map((option) => {
        const isSelected = facet.selectedKeys.includes(option.key);
        return (
          <label key={option.key} className={`ff-list__item ${isSelected ? "is-selected" : ""}`}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(event) => toggle(option.key, event.target.checked)}
            />
            <span className="ff-list__label">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
};
