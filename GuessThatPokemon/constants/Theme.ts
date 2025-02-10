import { DarkTheme, DefaultTheme } from '@react-navigation/native';

export const COLORS = {
  primary: '#2196F3',
  error: '#FF4B4B',
  success: '#4CAF50',
  
  pokemon: {
    yellow: '#FFCB05',
    blue: '#3D7DCA',
    red: '#FF0000',
    darkBlue: '#003A70',
  },

  types: {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
  },
  
  // Light theme (default)
  light: {
    background: '#F5F5F5',
    card: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#666666',
    border: '#E0E0E0',
    tabBar: '#FFFFFF',
  },
  
  // Dark theme
  dark: {
    background: '#F5F5F5', // Changed to light background
    card: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#666666',
    border: '#E0E0E0',
    tabBar: '#FFFFFF',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const FONTS = {
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  weight: {
    normal: '400',
    medium: '500',
    bold: '700',
  },
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5.84,
    elevation: 5,
  },
};

export const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: COLORS.primary,
    background: COLORS.dark.background,
    card: COLORS.dark.card,
    text: COLORS.dark.text,
    border: COLORS.dark.border,
  },
};

export const customLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    background: COLORS.light.background,
    card: COLORS.light.card,
    text: COLORS.light.text,
    border: COLORS.light.border,
  },
};

export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.dark.background,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.dark.card,
    ...SHADOWS.small,
  },
  card: {
    backgroundColor: COLORS.dark.surface,
    borderRadius: 16,
    padding: SPACING.md,
    margin: SPACING.sm,
    ...SHADOWS.small,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...SHADOWS.small,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: FONTS.weight.medium,
    fontSize: FONTS.size.md,
  },
  input: {
    height: 48,
    backgroundColor: COLORS.dark.surface,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    color: COLORS.dark.text,
    fontSize: FONTS.size.md,
  },
}; 