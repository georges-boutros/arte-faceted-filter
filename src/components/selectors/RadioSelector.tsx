import * as React from "react";
import { SelectorProps } from "./types";

export const RadioSelector: React.FC<SelectorProps> = ({ facet, options, onChange }) => {
  const name = `ff-radio-${facet.index}`;

  // We use onClick on the label (with preventDefault) rather than the input's
  // onChange so a click on an already-selected radio deselects it. Native
  // <input type="radio"> can only be checked, never unchecked, by the user.
  const handleClick = (event: React.MouseEvent<HTMLLabelElement>, key: string, isSelected: boolean) => {
    event.preventDefault();
    onChange(isSelected ? [] : [key]);
  };

  return (
    <div className="ff-list">
      {options.map((option) => {
        const isSelected = facet.selectedKeys[0] === option.key;
        return (
          <label
            key={option.key}
            className={`ff-list__item ${isSelected ? "is-selected" : ""}`}
            onClick={(event) => handleClick(event, option.key, isSelected)}
          >
            <input type="radio" name={name} checked={isSelected} readOnly tabIndex={-1} />
            <span className="ff-list__label">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
};
