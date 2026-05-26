export type Lang = "fr" | "de" | "en";

type TranslationKey =
  | "title"
  | "reset"
  | "clearFilter"
  | "search"
  | "selectAll"
  | "clearSelection"
  | "apply"
  | "noOptions"
  | "noSelection"
  | "allFacets"
  | "selectAFacet"
  | "showMore"
  | "showLess"
  | "items"
  | "selected"
  | "noFieldsBound"
  | "allFacetsHidden";

const translations: Record<Lang, Record<TranslationKey, string>> = {
  en: {
    title: "Facets",
    reset: "Reset",
    clearFilter: "Clear filter",
    search: "Search",
    selectAll: "Select all",
    clearSelection: "Clear selection",
    apply: "Apply",
    noOptions: "No options available",
    noSelection: "No filters applied",
    allFacets: "All",
    selectAFacet: "Select…",
    showMore: "Show more",
    showLess: "Show less",
    items: "items",
    selected: "selected",
    noFieldsBound: "Drag one or more columns into the Facets field",
    allFacetsHidden: "All facets are hidden — re-enable them in the formatting pane"
  },
  fr: {
    title: "Facettes",
    reset: "Réinitialiser",
    clearFilter: "Effacer les filtres",
    search: "Rechercher",
    selectAll: "Tout sélectionner",
    clearSelection: "Effacer la sélection",
    apply: "Appliquer",
    noOptions: "Aucune valeur disponible",
    noSelection: "Aucun filtre appliqué",
    allFacets: "Tous",
    selectAFacet: "Sélectionner…",
    showMore: "Voir plus",
    showLess: "Voir moins",
    items: "éléments",
    selected: "sélectionnés",
    noFieldsBound: "Glissez une ou plusieurs colonnes dans le champ Facettes",
    allFacetsHidden: "Toutes les facettes sont masquées — réactivez-les dans le volet de mise en forme"
  },
  de: {
    title: "Facetten",
    reset: "Zurücksetzen",
    clearFilter: "Filter löschen",
    search: "Suchen",
    selectAll: "Alle auswählen",
    clearSelection: "Auswahl löschen",
    apply: "Anwenden",
    noOptions: "Keine Optionen verfügbar",
    noSelection: "Kein Filter angewendet",
    allFacets: "Alle",
    selectAFacet: "Auswählen…",
    showMore: "Mehr anzeigen",
    showLess: "Weniger anzeigen",
    items: "Einträge",
    selected: "ausgewählt",
    noFieldsBound: "Ziehen Sie eine oder mehrere Spalten in das Feld Facetten",
    allFacetsHidden: "Alle Facetten sind ausgeblendet — aktivieren Sie sie im Formatierungsbereich"
  }
};

export interface FacetStrings {
  title: string;
  reset: string;
  clearFilter: string;
  search: string;
  selectAll: string;
  clearSelection: string;
  apply: string;
  noOptions: string;
  noSelection: string;
  allFacets: string;
  selectAFacet: string;
  showMore: string;
  showLess: string;
  items: string;
  selected: string;
  noFieldsBound: string;
  allFacetsHidden: string;
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
    reset: t(locale, "reset"),
    clearFilter: t(locale, "clearFilter"),
    search: t(locale, "search"),
    selectAll: t(locale, "selectAll"),
    clearSelection: t(locale, "clearSelection"),
    apply: t(locale, "apply"),
    noOptions: t(locale, "noOptions"),
    noSelection: t(locale, "noSelection"),
    allFacets: t(locale, "allFacets"),
    selectAFacet: t(locale, "selectAFacet"),
    showMore: t(locale, "showMore"),
    showLess: t(locale, "showLess"),
    items: t(locale, "items"),
    selected: t(locale, "selected"),
    noFieldsBound: t(locale, "noFieldsBound"),
    allFacetsHidden: t(locale, "allFacetsHidden")
  };
}
