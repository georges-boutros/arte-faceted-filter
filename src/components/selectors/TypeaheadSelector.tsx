import * as React from "react";
import { ChevronIcon } from "../../icons/ChevronIcon";
import { FacetOption } from "../../models/Facet";
import { SelectorProps } from "./types";

interface TypeaheadSelectorProps extends SelectorProps {
  /**
   * Optional title shown as the input placeholder when nothing is selected,
   * to mirror the Lovable-style embedded title pattern used by the dropdown.
   */
  embeddedTitle?: string;
}

/** Hard cap on rendered matches — anything beyond is hidden behind a hint.
 *  Tuned so a 30k-row facet stays responsive on each keystroke. */
const MAX_VISIBLE_MATCHES = 50;
const MIN_PANEL_HEIGHT = 140;
const PANEL_MARGIN = 8;
const MIN_PANEL_WIDTH = 220;

/** Diacritic-insensitive, case-insensitive normalisation so "Cinéma" matches
 *  a search for "cinema". */
function normalize(value: string): string {
  // Strip combining diacritical marks (U+0300 to U+036F) so "Cinéma" matches "cinema".
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export const TypeaheadSelector: React.FC<TypeaheadSelectorProps> = ({
  facet,
  options,
  strings,
  onChange,
  embeddedTitle
}) => {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [panelStyle, setPanelStyle] = React.useState<React.CSSProperties>({});

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const controlRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  // Filter is run on EVERY keystroke. For 30k options this is sub-millisecond
  // JS work; we cap rendering at MAX_VISIBLE_MATCHES so the DOM never has to
  // mount thousands of nodes.
  const { matches, totalMatching } = React.useMemo(() => {
    const q = normalize(query.trim());
    const selectedSet = new Set(facet.selectedKeys);
    let total = 0;
    const out: FacetOption[] = [];
    for (const option of options) {
      if (selectedSet.has(option.key)) {
        continue;
      }
      if (q && !normalize(option.label).includes(q)) {
        continue;
      }
      total += 1;
      if (out.length < MAX_VISIBLE_MATCHES) {
        out.push(option);
      }
    }
    return { matches: out, totalMatching: total };
  }, [options, query, facet.selectedKeys]);

  const selectedOptions = React.useMemo(() => {
    const labelByKey = new Map(facet.options.map((option) => [option.key, option.label]));
    return facet.selectedKeys.map((key) => ({
      key,
      label: labelByKey.get(key) || key || "(blank)"
    }));
  }, [facet.options, facet.selectedKeys]);

  React.useLayoutEffect(() => {
    if (!open || !controlRef.current) {
      return;
    }

    const updatePosition = () => {
      const anchor = controlRef.current;
      if (!anchor) {
        return;
      }
      const rect = anchor.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const vw = window.innerWidth || document.documentElement.clientWidth;
      const spaceBelow = vh - rect.bottom - PANEL_MARGIN;
      const spaceAbove = rect.top - PANEL_MARGIN;
      const flipUp = spaceBelow < MIN_PANEL_HEIGHT && spaceAbove > spaceBelow;
      const availableHeight = Math.max(MIN_PANEL_HEIGHT, flipUp ? spaceAbove : spaceBelow);

      const desiredWidth = Math.max(rect.width, MIN_PANEL_WIDTH);
      const maxFromLeft = Math.max(MIN_PANEL_WIDTH, vw - rect.left - PANEL_MARGIN);
      const width = Math.min(desiredWidth, maxFromLeft);
      const leftOverflow = rect.left + width > vw - PANEL_MARGIN;
      const left = leftOverflow ? Math.max(PANEL_MARGIN, vw - width - PANEL_MARGIN) : rect.left;

      // Round to integers — sub-pixel positions blur the text inside the panel.
      const next: React.CSSProperties = {
        position: "fixed",
        left: Math.round(left),
        width: Math.round(width),
        maxHeight: Math.round(availableHeight),
        zIndex: 1000
      };
      if (flipUp) {
        next.bottom = Math.round(vh - rect.top + 4);
      } else {
        next.top = Math.round(rect.bottom + 4);
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
  }, [open, selectedOptions.length, matches.length]);

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
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, [open]);

  // Reset active highlight when the candidate list changes shape.
  React.useEffect(() => {
    setActiveIndex(matches.length > 0 ? 0 : -1);
  }, [matches.length]);

  const addValue = (key: string) => {
    if (facet.selectionMode === "single") {
      onChange([key]);
      setQuery("");
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (facet.selectedKeys.includes(key)) {
      return;
    }
    onChange([...facet.selectedKeys, key]);
    setQuery("");
    // keep panel open in multi-mode so the user can pick several values
    inputRef.current?.focus();
  };

  const removeValue = (key: string) => {
    onChange(facet.selectedKeys.filter((k) => k !== key));
  };

  const handleInputKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
      }
      setActiveIndex((prev) => Math.min(matches.length - 1, prev < 0 ? 0 : prev + 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(0, prev - 1));
      return;
    }
    if (event.key === "Enter") {
      if (activeIndex >= 0 && matches[activeIndex]) {
        event.preventDefault();
        addValue(matches[activeIndex].key);
      }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (event.key === "Backspace" && query === "" && facet.selectedKeys.length > 0) {
      event.preventDefault();
      const last = facet.selectedKeys[facet.selectedKeys.length - 1];
      removeValue(last);
    }
  };

  const placeholder = selectedOptions.length === 0
    ? embeddedTitle
      ? `${embeddedTitle} · ${strings.search.toLowerCase()}…`
      : `${strings.search}…`
    : "";

  return (
    <div className="ff-typeahead" ref={containerRef}>
      <div
        className={`ff-typeahead__control ${open ? "is-open" : ""} ${
          selectedOptions.length > 0 ? "has-selection" : ""
        }`}
        ref={controlRef}
        onClick={() => {
          inputRef.current?.focus();
          setOpen(true);
        }}
      >
        {selectedOptions.map((option) => (
          <span key={option.key} className="ff-typeahead__chip" onClick={(e) => e.stopPropagation()}>
            <span className="ff-typeahead__chip-value">{option.label}</span>
            <button
              type="button"
              className="ff-typeahead__chip-remove"
              onClick={(e) => {
                e.stopPropagation();
                removeValue(option.key);
              }}
              aria-label={`${strings.removeValue} ${option.label}`}
              title={`${strings.removeValue} ${option.label}`}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                <path
                  d="M2 2 L8 8 M8 2 L2 8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </span>
        ))}
        <input
          type="text"
          ref={inputRef}
          className="ff-typeahead__input"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            if (!open) {
              setOpen(true);
            }
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleInputKey}
          placeholder={placeholder}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`ff-typeahead-panel-${facet.queryName}`}
        />
        <span className="ff-typeahead__arrow" aria-hidden="true">
          <ChevronIcon open={open} />
        </span>
      </div>

      {open ? (
        <div
          id={`ff-typeahead-panel-${facet.queryName}`}
          ref={panelRef}
          className="ff-typeahead__panel"
          role="listbox"
          style={panelStyle}
        >
          {matches.length === 0 ? (
            <div className="ff-typeahead__empty">
              {query.trim() ? strings.noOptions : strings.noOptions}
            </div>
          ) : (
            <>
              <div className="ff-typeahead__list">
                {matches.map((option, index) => (
                  <button
                    key={option.key}
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    className={`ff-typeahead__item ${index === activeIndex ? "is-active" : ""}`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => addValue(option.key)}
                  >
                    <span className="ff-typeahead__item-label">{option.label}</span>
                  </button>
                ))}
              </div>
              {totalMatching > matches.length ? (
                <div className="ff-typeahead__more">
                  +{totalMatching - matches.length} {strings.items} — {strings.search.toLowerCase()}
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
};
