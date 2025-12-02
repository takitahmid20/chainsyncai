/**
 * Typography tokens from ChainSync AI design
 */

export const Typography = {
  fontFamily: {
    default: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
  },
  
  fontSize: {
    xs: 10,
    sm: 11,
    md: 13,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 22,
    '3xl': 24,
    '4xl': 28,
  },
  
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.5,
    loose: 1.6,
  },
};
