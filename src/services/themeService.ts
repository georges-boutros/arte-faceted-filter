import { StyleSettings } from "../settings";

export type EffectiveThemeMode = "light" | "dark" | "custom";

export interface ReportThemeContext {
  backgroundColor?: string;
  foregroundColor?: string;
  accentColor?: string;
  isHighContrast?: boolean;
}

interface ThemeTokens {
  visualBg: string;
  panelBg: string;
  surfaceBg: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  dropdownBg: string;
  dropdownBorder: string;
  textPrimary: string;
  textSecondary: string;
  placeholder: string;
  accent: string;
  accentHover: string;
  buttonBg: string;
  buttonText: string;
  buttonBorder: string;
  iconColor: string;
  selectedBg: string;
  selectedText: string;
  hoverBg: string;
  focusBorder: string;
  divider: string;
  borderColor: string;
  disabledBg: string;
  disabledText: string;
  shadowColor: string;
  chipSelectedBg: string;
  chipSelectedText: string;
  scrollbarThumb: string;
  scrollbarThumbHover: string;
}

// ARTE brand palette: accent = #fa471d, neutrals from the ARTE Power BI theme
// files. Kept in lockstep with arte-calendar-date-slicer so visuals on the
// same report blend together without manual tweaking.
const lightTheme: ThemeTokens = {
  visualBg: "transparent",
  panelBg: "#ffffff",
  surfaceBg: "#fafafa",
  inputBg: "#ffffff",
  inputBorder: "#e5e7eb",
  inputText: "#212831",
  dropdownBg: "#ffffff",
  dropdownBorder: "#e5e7eb",
  textPrimary: "#212831",
  textSecondary: "#7a7a7a",
  placeholder: "#b3b0ad",
  accent: "#fa471d",
  accentHover: "#d93a17",
  buttonBg: "transparent",
  buttonText: "#212831",
  buttonBorder: "#e5e7eb",
  iconColor: "#7a7a7a",
  selectedBg: "#fde6df",
  selectedText: "#212831",
  hoverBg: "#f3f2f1",
  focusBorder: "#fdcdbe",
  divider: "#eef0f3",
  borderColor: "#e5e7eb",
  disabledBg: "#f3f2f1",
  disabledText: "#b3b0ad",
  shadowColor: "rgba(33, 40, 49, 0.08)",
  chipSelectedBg: "#fa471d",
  chipSelectedText: "#ffffff",
  scrollbarThumb: "rgba(33, 40, 49, 0.22)",
  scrollbarThumbHover: "rgba(33, 40, 49, 0.40)"
};

const darkTheme: ThemeTokens = {
  visualBg: "transparent",
  panelBg: "#1f1f1f",
  surfaceBg: "#1a1a1a",
  inputBg: "#000000",
  inputBorder: "#333333",
  inputText: "#ffffff",
  dropdownBg: "#1f1f1f",
  dropdownBorder: "#333333",
  textPrimary: "#ffffff",
  textSecondary: "#b3b0ad",
  placeholder: "#7a7a7a",
  accent: "#fa471d",
  accentHover: "#ff6a3d",
  buttonBg: "transparent",
  buttonText: "#ffffff",
  buttonBorder: "#333333",
  iconColor: "#b3b0ad",
  selectedBg: "#3a1f17",
  selectedText: "#ffffff",
  hoverBg: "#262626",
  focusBorder: "#7a2a18",
  divider: "#262626",
  borderColor: "#333333",
  disabledBg: "#1f1f1f",
  disabledText: "#7a7a7a",
  shadowColor: "rgba(0, 0, 0, 0.5)",
  chipSelectedBg: "#fa471d",
  chipSelectedText: "#ffffff",
  scrollbarThumb: "rgba(255, 255, 255, 0.18)",
  scrollbarThumbHover: "rgba(255, 255, 255, 0.34)"
};

function hexToRgb(color: string): { r: number; g: number; b: number } | null {
  const hex = color.trim().replace("#", "");
  if (!/^[0-9a-fA-F]{3,8}$/.test(hex)) {
    return null;
  }

  const normalized = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex.slice(0, 6);
  const int = Number.parseInt(normalized, 16);
  if (!Number.isFinite(int)) {
    return null;
  }

  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255
  };
}

function isDarkColor(color: string): boolean {
  const rgb = hexToRgb(color);
  if (!rgb) {
    return false;
  }

  const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  return luminance < 0.45;
}

function resolveThemeMode(style: StyleSettings, reportTheme: ReportThemeContext): EffectiveThemeMode {
  if (style.themeMode === "light" || style.themeMode === "dark" || style.themeMode === "custom") {
    return style.themeMode;
  }

  if (reportTheme.isHighContrast) {
    return reportTheme.backgroundColor && isDarkColor(reportTheme.backgroundColor) ? "dark" : "light";
  }

  if (reportTheme.backgroundColor) {
    return isDarkColor(reportTheme.backgroundColor) ? "dark" : "light";
  }

  return "light";
}

function normalizeColor(value: string | undefined, fallback: string): string {
  return value && value.trim().length > 0 ? value : fallback;
}

function buildCustomTheme(style: StyleSettings, fallback: ThemeTokens): ThemeTokens {
  return {
    visualBg: normalizeColor(style.visualBackground, fallback.visualBg),
    panelBg: normalizeColor(style.panelBackground, fallback.panelBg),
    surfaceBg: normalizeColor(style.surfaceBackground, fallback.surfaceBg),
    inputBg: normalizeColor(style.inputBackground, fallback.inputBg),
    inputBorder: normalizeColor(style.inputBorder, fallback.inputBorder),
    inputText: normalizeColor(style.inputTextColor, fallback.inputText),
    dropdownBg: normalizeColor(style.dropdownBackground, fallback.dropdownBg),
    dropdownBorder: normalizeColor(style.dropdownBorder, fallback.dropdownBorder),
    textPrimary: normalizeColor(style.textPrimaryColor, fallback.textPrimary),
    textSecondary: normalizeColor(style.textSecondaryColor, fallback.textSecondary),
    placeholder: normalizeColor(style.placeholderColor, fallback.placeholder),
    accent: normalizeColor(style.accentColor, fallback.accent),
    accentHover: normalizeColor(style.accentHoverColor, fallback.accentHover),
    buttonBg: normalizeColor(style.buttonBackground, fallback.buttonBg),
    buttonText: normalizeColor(style.buttonText, fallback.buttonText),
    buttonBorder: normalizeColor(style.buttonBorder, fallback.buttonBorder),
    iconColor: normalizeColor(style.iconColor, fallback.iconColor),
    selectedBg: normalizeColor(style.selectedBackgroundColor, fallback.selectedBg),
    selectedText: normalizeColor(style.selectedTextColor, fallback.selectedText),
    hoverBg: normalizeColor(style.hoverBackgroundColor, fallback.hoverBg),
    focusBorder: normalizeColor(style.focusBorderColor, fallback.focusBorder),
    divider: normalizeColor(style.dividerColor, fallback.divider),
    borderColor: normalizeColor(style.borderColor, fallback.borderColor),
    disabledBg: normalizeColor(style.disabledBackgroundColor, fallback.disabledBg),
    disabledText: normalizeColor(style.disabledTextColor, fallback.disabledText),
    shadowColor: normalizeColor(style.shadowColor, fallback.shadowColor),
    chipSelectedBg: fallback.chipSelectedBg,
    chipSelectedText: fallback.chipSelectedText,
    scrollbarThumb: fallback.scrollbarThumb,
    scrollbarThumbHover: fallback.scrollbarThumbHover
  };
}

export function resolveTheme(
  style: StyleSettings,
  reportTheme: ReportThemeContext
): { themeName: EffectiveThemeMode; cssVariables: Record<string, string> } {
  const themeName = resolveThemeMode(style, reportTheme);
  const baseTheme = themeName === "dark" ? darkTheme : lightTheme;

  const resolvedTheme =
    themeName === "custom"
      ? buildCustomTheme(
          style,
          reportTheme.backgroundColor && isDarkColor(reportTheme.backgroundColor) ? darkTheme : lightTheme
        )
      : baseTheme;

  const compactStep = Math.max(0, Math.min(3, style.compactDensity || 0));
  const spacingUnit = Math.max(2, 8 - compactStep * 2);
  const radius = Math.max(0, Math.min(36, style.borderRadius || 8));
  const radiusSm = Math.max(2, Math.round(radius / 2));
  const radiusLg = Math.min(36, Math.round(radius * 1.5));
  const shadowValue = style.shadowEnabled
    ? `0 4px 12px ${resolvedTheme.shadowColor}, 0 1px 2px ${resolvedTheme.shadowColor}`
    : "none";

  const cssVariables: Record<string, string> = {
    "--visual-bg": resolvedTheme.visualBg,
    "--panel-bg": resolvedTheme.panelBg,
    "--surface-bg": resolvedTheme.surfaceBg,
    "--input-bg": resolvedTheme.inputBg,
    "--input-border": resolvedTheme.inputBorder,
    "--input-text": resolvedTheme.inputText,
    "--dropdown-bg": resolvedTheme.dropdownBg,
    "--dropdown-border": resolvedTheme.dropdownBorder,
    "--text-primary": resolvedTheme.textPrimary,
    "--text-secondary": resolvedTheme.textSecondary,
    "--placeholder-color": resolvedTheme.placeholder,
    "--accent-color": resolvedTheme.accent,
    "--accent-hover": resolvedTheme.accentHover,
    "--button-bg": resolvedTheme.buttonBg,
    "--button-text": resolvedTheme.buttonText,
    "--button-border": resolvedTheme.buttonBorder,
    "--icon-color": resolvedTheme.iconColor,
    "--selected-bg": resolvedTheme.selectedBg,
    "--selected-text": resolvedTheme.selectedText,
    "--hover-bg": resolvedTheme.hoverBg,
    "--focus-border": resolvedTheme.focusBorder,
    "--divider-color": resolvedTheme.divider,
    "--border-color": resolvedTheme.borderColor,
    "--disabled-bg": resolvedTheme.disabledBg,
    "--disabled-text": resolvedTheme.disabledText,
    "--chip-selected-bg": resolvedTheme.chipSelectedBg,
    "--chip-selected-text": resolvedTheme.chipSelectedText,
    "--scrollbar-thumb": resolvedTheme.scrollbarThumb,
    "--scrollbar-thumb-hover": resolvedTheme.scrollbarThumbHover,
    "--shadow-elevation": shadowValue,
    "--radius-sm": `${radiusSm}px`,
    "--radius": `${radius}px`,
    "--radius-lg": `${radiusLg}px`,
    "--font-size": `${Math.max(10, Math.min(24, style.fontSize || 12))}px`,
    "--font-size-sm": `${Math.max(9, Math.min(22, (style.fontSize || 12) - 1))}px`,
    "--font-size-xs": `${Math.max(8, Math.min(20, (style.fontSize || 12) - 2))}px`,
    "--font-family": style.fontFamily || "Segoe UI, Arial, sans-serif",
    "--space-unit": `${spacingUnit}px`,
    "--cell-space": `${Math.max(0, Math.min(14, style.cellSpacing || 4))}px`
  };

  return { themeName, cssVariables };
}
