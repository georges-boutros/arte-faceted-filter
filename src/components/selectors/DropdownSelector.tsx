import * as React from "react";
import { ChevronIcon } from "../../icons/ChevronIcon";
import { SelectorProps } from "./types";

interface DropdownSelectorProps extends SelectorProps {
  /**
   * Optional title shown inside the dropdown button (Lovable-style).
   * When set, the button renders "<title> · <value>" or just "<title>"
   * when nothing is selected, replacing any external facet header.
   */
  embeddedTitle?: string;
}

export const DropdownSelector: React.FC<DropdownSelectorProps> = ({
  facet,
  options,
  strings,
  onChange,
  embeddedTitle
}) => {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (!open) {
      return;
    }
    const handleDocClick = (event: MouseEvent) => {
      if (!containerRef.current) {
        return;
      }
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const selectionSummary = React.useMemo(() => {
    if (!facet.selectedKeys.length) {
      return "";
    }
    const labels = facet.selectedKeys.map(
      (key) => facet.options.find((option) => option.key === key)?.label || key || "(blank)"
    );
    if (labels.length <= 2) {
      return labels.join(", ");
    }
    return `${labels.length} ${strings.selected}`;
  }, [facet.selectedKeys, facet.options, strings.selected]);

  const hasSelection = facet.selectedKeys.length > 0;
  const showEmbeddedTitle = !!embeddedTitle;

  const toggle = (key: string) => {
    if (facet.selectionMode === "single") {
      onChange(facet.selectedKeys[0] === key ? [] : [key]);
      setOpen(false);
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
    <div className="ff-dropdown" ref={containerRef}>
      <button
        type="button"
        ref={buttonRef}
        className={`ff-dropdown__btn cds-date-selector__combo-btn ${open ? "is-open" : ""} ${
          showEmbeddedTitle ? "ff-dropdown__btn--embedded" : ""
        } ${hasSelection ? "has-selection" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={embeddedTitle || undefined}
        title={embeddedTitle ? `${embeddedTitle}${selectionSummary ? `: ${selectionSummary}` : ""}` : undefined}
      >
        <span className="ff-dropdown__btn-text cds-date-selector__combo-text">
          {showEmbeddedTitle ? (
            <>
              <span className="ff-dropdown__btn-label">{embeddedTitle}</span>
              {hasSelection ? (
                <>
                  <span className="ff-dropdown__btn-sep" aria-hidden="true">
                    ·
                  </span>
                  <span className="ff-dropdown__btn-value">{selectionSummary}</span>
                </>
              ) : null}
            </>
          ) : (
            <>{hasSelection ? selectionSummary : strings.selectAFacet}</>
          )}
        </span>
        <span className="ff-dropdown__btn-arrow cds-date-selector__combo-arrow">
          <ChevronIcon open={open} />
        </span>
      </button>

      {open ? (
        <div
          className="ff-dropdown__panel cds-date-selector__panel"
          role="listbox"
          aria-multiselectable={facet.selectionMode === "multi"}
        >
          {options.length === 0 ? (
            <div className="cds-date-selector__empty">{strings.noOptions}</div>
          ) : (
            <div className="ff-dropdown__list cds-date-selector__list">
              {options.map((option) => {
                const isSelected = facet.selectedKeys.includes(option.key);
                return (
                  <label
                    key={option.key}
                    className={`cds-date-selector__item ${isSelected ? "is-selected" : ""}`}
                  >
                    {facet.selectionMode === "single" ? (
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => toggle(option.key)}
                      />
                    ) : (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggle(option.key)}
                      />
                    )}
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
