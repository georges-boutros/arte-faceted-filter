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
}

const lightTheme: ThemeTokens = {
  visualBg: "#ffffff",
  panelBg: "#ffffff",
  surfaceBg: "#fafafa",
  inputBg: "#ffffff",
  inputBorder: "#e5e7eb",
  inputText: "#1f2328",
  dropdownBg: "#ffffff",
  dropdownBorder: "#e5e7eb",
  textPrimary: "#1f2328",
  textSecondary: "#6b7280",
  placeholder: "#9aa0a6",
  accent: "#2f6feb",
  accentHover: "#1f4fc4",
  buttonBg: "transparent",
  buttonText: "#1f2328",
  buttonBorder: "#e5e7eb",
  iconColor: "#6b7280",
  selectedBg: "#e7eef8",
  selectedText: "#1f2328",
  hoverBg: "#f4f5f7",
  focusBorder: "#c9d3e2",
  divider: "#eef0f3",
  borderColor: "#e5e7eb",
  disabledBg: "#f4f5f7",
  disabledText: "#b3b7be",
  shadowColor: "rgba(15, 23, 42, 0.08)",
  chipSelectedBg: "#ff5a1f",
  chipSelectedText: "#ffffff"
};

const darkTheme: ThemeTokens = {
  visualBg: "#15171c",
  panelBg: "#1c1f25",
  surfaceBg: "#1f232b",
  inputBg: "#1c1f25",
  inputBorder: "#2c3140",
  inputText: "#e6e9ef",
  dropdownBg: "#1c1f25",
  dropdownBorder: "#2c3140",
  textPrimary: "#e6e9ef",
  textSecondary: "#9aa3b2",
  placeholder: "#6b7280",
  accent: "#5b8def",
  accentHover: "#7ba2f4",
  buttonBg: "transparent",
  buttonText: "#e6e9ef",
  buttonBorder: "#2c3140",
  iconColor: "#9aa3b2",
  selectedBg: "#26344f",
  selectedText: "#e6e9ef",
  hoverBg: "#252a35",
  focusBorder: "#3a4660",
  divider: "#252a35",
  borderColor: "#2c3140",
  disabledBg: "#1c1f25",
  disabledText: "#525a6b",
  shadowColor: "rgba(0, 0, 0, 0.5)",
  chipSelectedBg: "#ff6a36",
  chipSelectedText: "#ffffff"
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
    chipSelectedText: fallback.chipSelectedText
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
    "--shadow-elevation": shadowValue,
    "--radius-sm": `${radiusSm}px`,
    "--radius": `${radius}px`,
    "--radius-lg": `${radiusLg}px`,
    "--font-size": `${Math.max(10, Math.min(24, style.fontSize || 12))}px`,
    "--space-unit": `${spacingUnit}px`,
    "--cell-space": `${Math.max(0, Math.min(14, style.cellSpacing || 4))}px`
  };

  return { themeName, cssVariables };
}
