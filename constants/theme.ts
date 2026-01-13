/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const Palette = {
  primary: '#6C63FF', // Vibrant Purple/Indigo
  primaryLight: '#8F89FF', // Lighter Purple
  secondary: '#00D2D3', // Bright Teal
  background: '#F8F9FD', // Very light cool gray
  surface: '#FFFFFF',
  text: '#2D3436', // Dark Slate
  textSecondary: '#636E72', // Slate Gray
  danger: '#FF6B6B', // Soft Red
  border: '#DFE6E9', // Light Gray
  success: '#1DD1A1', // Soft Green
  warning: '#FCA5A5', // Soft Orange
};

export const Colors = {
  light: {
    ...Palette,
    tint: Palette.primary,
    icon: Palette.textSecondary,
    tabIconDefault: Palette.textSecondary,
    tabIconSelected: Palette.primary,
    // Gradient colors for reference
    gradientPrimary: ['#6C63FF', '#4834D4'] as const,
    gradientSecondary: ['#00D2D3', '#01A3A4'] as const,
  },
  dark: {
    ...Palette,
    text: '#DFE6E9',
    background: '#2D3436',
    tint: Palette.primaryLight,
    icon: '#B2BEC3',
    tabIconDefault: '#B2BEC3',
    tabIconSelected: Palette.primaryLight,
    surface: '#394042',
    // Override specific palette values for dark mode
    border: '#636E72',
    gradientPrimary: ['#8F89FF', '#6C63FF'] as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
