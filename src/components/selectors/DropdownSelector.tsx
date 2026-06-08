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

const MIN_PANEL_HEIGHT = 120;
const PANEL_MARGIN = 8;
const MIN_PANEL_WIDTH = 200;

export const DropdownSelector: React.FC<DropdownSelectorProps> = ({
  facet,
  options,
  strings,
  onChange,
  embeddedTitle
}) => {
  const [open, setOpen] = React.useState(false);
  const [panelStyle, setPanelStyle] = React.useState<React.CSSProperties>({});
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  // Compute panel position whenever it opens. Uses the iframe viewport
  // (window.innerHeight/Width) since Power BI sandboxes the visual — we
  // can't escape the frame but we can use every pixel available within it.
  React.useLayoutEffect(() => {
    if (!open || !buttonRef.current) {
      return;
    }

    const updatePosition = () => {
      const btn = buttonRef.current;
      if (!btn) {
        return;
      }
      const rect = btn.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

      const spaceBelow = viewportHeight - rect.bottom - PANEL_MARGIN;
      const spaceAbove = rect.top - PANEL_MARGIN;
      // Flip up when there's clearly more room above and below is cramped.
      const flipUp = spaceBelow < MIN_PANEL_HEIGHT && spaceAbove > spaceBelow;
      const availableHeight = Math.max(MIN_PANEL_HEIGHT, flipUp ? spaceAbove : spaceBelow);

      // Match button width but never go narrower than MIN_PANEL_WIDTH, and
      // never wider than the viewport allows from the button's left edge.
      const desiredWidth = Math.max(rect.width, MIN_PANEL_WIDTH);
      const maxFromLeft = Math.max(MIN_PANEL_WIDTH, viewportWidth - rect.left - PANEL_MARGIN);
      const width = Math.min(desiredWidth, maxFromLeft);
      // If the button is so far right that even MIN_PANEL_WIDTH overflows,
      // pin the panel to the viewport right edge instead.
      const leftOverflow = rect.left + width > viewportWidth - PANEL_MARGIN;
      const left = leftOverflow ? Math.max(PANEL_MARGIN, viewportWidth - width - PANEL_MARGIN) : rect.left;

      const next: React.CSSProperties = {
        position: "fixed",
        left,
        width,
        maxHeight: availableHeight,
        zIndex: 1000
      };

      if (flipUp) {
        next.bottom = viewportHeight - rect.top + 4;
      } else {
        next.top = rect.bottom + 4;
      }

      setPanelStyle(next);
    };

    updatePosition();

    const handleScroll = () => updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) {
      return;
    }
    const handleDocClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) {
        return;
      }
      if (panelRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
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
          ref={panelRef}
          className="ff-dropdown__panel"
          role="listbox"
          aria-multiselectable={facet.selectionMode === "multi"}
          style={panelStyle}
        >
          {options.length === 0 ? (
            <div className="cds-date-selector__empty">{strings.noOptions}</div>
          ) : (
            <div className="ff-dropdown__list">
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
