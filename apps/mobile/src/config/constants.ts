export const CONFIG = {
  // Production API URL
  API_BASE_URL: "https://garage.grekam.in/api/v1",
  
  // Storage Keys
  STORAGE_TOKEN: "grekam_auth_token",
  STORAGE_USER: "grekam_user_data",

  // Apple iOS Human Interface Guidelines (HIG) Dark System Tokens
  COLORS: {
    bgBase: "#000000",                  // Pure OLED True Black (Apple Canvas)
    bgSurface: "#1C1C1E",               // iOS Secondary System Grouped Background
    bgElevated: "#2C2C2E",              // iOS Tertiary System Grouped Background
    bgCardHigh: "#3A3A3C",              // iOS Quaternary Fill / Specular Inset
    borderSubtle: "rgba(255, 255, 255, 0.08)", // Specular hairline separator
    borderStrong: "rgba(255, 255, 255, 0.16)",
    primary: "#0A84FF",                 // Apple System Blue (Dark)
    primaryHover: "#0071E3",
    emerald: "#30D158",                 // Apple System Green (Dark)
    amber: "#FF9F0A",                   // Apple System Orange/Amber (Dark)
    purple: "#BF5AF2",                  // Apple System Purple (Dark)
    indigo: "#5E5CE6",                  // Apple System Indigo (Dark)
    rose: "#FF453A",                    // Apple System Red (Dark)
    textPrimary: "#FFFFFF",             // Apple Primary Label
    textSecondary: "rgba(235, 235, 245, 0.60)", // Apple Secondary Label
    textMuted: "rgba(235, 235, 245, 0.35)",     // Apple Tertiary Label
  }
};
