import * as React from "react";
import { SelectorProps } from "./types";

export const ListSelector: React.FC<SelectorProps> = ({ facet, options, onChange }) => {
  const handleClick = (key: string) => {
    if (facet.selectionMode === "single") {
      onChange(facet.selectedKeys[0] === key ? [] : [key]);
      return;
    }
    const set = new Set(facet.selectedKeys);
    if (set.has(key)) {
      set.delete(key);
    } else {
      set.add(key);
    }
    onChange(Array.from(set));
  };

  return (
    <div className="ff-plain-list">
      {options.map((option) => {
        const isSelected = facet.selectedKeys.includes(option.key);
        return (
          <button
            key={option.key}
            type="button"
            className={`ff-plain-list__item ${isSelected ? "is-selected" : ""}`}
            onClick={() => handleClick(option.key)}
          >
            <span className="ff-plain-list__label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};
