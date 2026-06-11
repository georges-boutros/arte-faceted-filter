export type Lang = "fr" | "de" | "en";

type TranslationKey =
  | "title"
  | "clearFilter"
  | "search"
  | "selectAll"
  | "clearSelection"
  | "noOptions"
  | "noSelection"
  | "allFacets"
  | "selectAFacet"
  | "items"
  | "selected"
  | "noFieldsBound"
  | "allFacetsHidden"
  | "activeFilters"
  | "removeValue"
  | "noActiveSelection";

const translations: Record<Lang, Record<TranslationKey, string>> = {
  en: {
    title: "Facets",
    clearFilter: "Clear filter",
    search: "Search",
    selectAll: "Select all",
    clearSelection: "Clear selection",
    noOptions: "No options available",
    noSelection: "No filters applied",
    allFacets: "All",
    selectAFacet: "Select…",
    items: "items",
    selected: "selected",
    noFieldsBound: "Drag one or more columns into the Facets field",
    allFacetsHidden: "All facets are hidden — re-enable them in the formatting pane",
    activeFilters: "Active filters",
    removeValue: "Remove",
    noActiveSelection: "No active selection"
  },
  fr: {
    title: "Facettes",
    clearFilter: "Effacer les filtres",
    search: "Rechercher",
    selectAll: "Tout sélectionner",
    clearSelection: "Effacer la sélection",
    noOptions: "Aucune valeur disponible",
    noSelection: "Aucun filtre appliqué",
    allFacets: "Tous",
    selectAFacet: "Sélectionner…",
    items: "éléments",
    selected: "sélectionnés",
    noFieldsBound: "Glissez une ou plusieurs colonnes dans le champ Facettes",
    allFacetsHidden: "Toutes les facettes sont masquées — réactivez-les dans le volet de mise en forme",
    activeFilters: "Filtres actifs",
    removeValue: "Retirer",
    noActiveSelection: "Aucune sélection active"
  },
  de: {
    title: "Facetten",
    clearFilter: "Filter löschen",
    search: "Suchen",
    selectAll: "Alle auswählen",
    clearSelection: "Auswahl löschen",
    noOptions: "Keine Optionen verfügbar",
    noSelection: "Kein Filter angewendet",
    allFacets: "Alle",
    selectAFacet: "Auswählen…",
    items: "Einträge",
    selected: "ausgewählt",
    noFieldsBound: "Ziehen Sie eine oder mehrere Spalten in das Feld Facetten",
    allFacetsHidden: "Alle Facetten sind ausgeblendet — aktivieren Sie sie im Formatierungsbereich",
    activeFilters: "Aktive Filter",
    removeValue: "Entfernen",
    noActiveSelection: "Keine aktive Auswahl"
  }
};

export interface FacetStrings {
  title: string;
  clearFilter: string;
  search: string;
  selectAll: string;
  clearSelection: string;
  noOptions: string;
  noSelection: string;
  allFacets: string;
  selectAFacet: string;
  items: string;
  selected: string;
  noFieldsBound: string;
  allFacetsHidden: string;
  activeFilters: string;
  removeValue: string;
  noActiveSelection: string;
}

export function getLang(locale: string): Lang {
  const lower = (locale || "").toLowerCase();
  if (lower.startsWith("fr")) {
    return "fr";
  }
  if (lower.startsWith("de")) {
    return "de";
  }
  return "en";
}

export function resolveVisualLocale(hostLocale?: string): string {
  if (hostLocale && hostLocale.trim()) {
    return hostLocale;
  }
  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language;
  }
  return "en";
}

export function t(locale: string, key: TranslationKey): string {
  const lang = getLang(locale);
  return translations[lang][key] ?? translations.en[key];
}

export function getFacetStrings(locale: string): FacetStrings {
  return {
    title: t(locale, "title"),
    clearFilter: t(locale, "clearFilter"),
    search: t(locale, "search"),
    selectAll: t(locale, "selectAll"),
    clearSelection: t(locale, "clearSelection"),
    noOptions: t(locale, "noOptions"),
    noSelection: t(locale, "noSelection"),
    allFacets: t(locale, "allFacets"),
    selectAFacet: t(locale, "selectAFacet"),
    items: t(locale, "items"),
    selected: t(locale, "selected"),
    noFieldsBound: t(locale, "noFieldsBound"),
    allFacetsHidden: t(locale, "allFacetsHidden"),
    activeFilters: t(locale, "activeFilters"),
    removeValue: t(locale, "removeValue"),
    noActiveSelection: t(locale, "noActiveSelection")
  };
}
