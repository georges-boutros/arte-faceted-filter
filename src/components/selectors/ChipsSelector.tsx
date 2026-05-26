import * as React from "react";
import { SelectorProps } from "./types";

export const ChipsSelector: React.FC<SelectorProps> = ({ facet, options, onChange }) => {
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
    <div className="ff-chips">
      {options.map((option) => {
        const isSelected = facet.selectedKeys.includes(option.key);
        return (
          <button
            key={option.key}
            type="button"
            className={`ff-chip ${isSelected ? "is-selected" : ""}`}
            onClick={() => handleClick(option.key)}
            title={option.label}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
