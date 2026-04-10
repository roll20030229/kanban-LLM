import { createStitches } from '@stitches/react'

export const {
  styled,
  css,
  globalCss,
  keyframes,
  getCssText,
  theme,
  createTheme,
  config,
} = createStitches({
  theme: {
    colors: {
      background: '#000000',
      backgroundElevated: 'rgba(255, 255, 255, 0.03)',
      backgroundGlass: 'rgba(255, 255, 255, 0.06)',
      backgroundGlassHover: 'rgba(255, 255, 255, 0.10)',
      foreground: '#f0f0f5',
      foregroundMuted: 'rgba(240, 240, 245, 0.55)',
      foregroundSubtle: 'rgba(240, 240, 245, 0.35)',

      auroraBlue: '#4f8fff',
      auroraPurple: '#a855f7',
      auroraCyan: '#22d3ee',
      auroraPink: '#ec4899',

      primary: '#ffffff',
      primaryMuted: 'rgba(255, 255, 255, 0.7)',
      
      accent: '#a855f7',
      accentMuted: 'rgba(168, 85, 247, 0.6)',

      todo: '#4f8fff',
      inProgress: '#a855f7',
      inReview: '#f59e0b',
      done: '#22d3ee',

      border: 'rgba(255, 255, 255, 0.08)',
      borderHover: 'rgba(255, 255, 255, 0.15)',
      borderActive: 'rgba(255, 255, 255, 0.22)',

      glassBg: 'rgba(255, 255, 255, 0.05)',
      glassBgHover: 'rgba(255, 255, 255, 0.08)',
      glassBorder: 'rgba(255, 255, 255, 0.10)',
      glassBorderHover: 'rgba(255, 255, 255, 0.18)',

      input: 'rgba(255, 255, 255, 0.05)',
      inputBorder: 'rgba(255, 255, 255, 0.10)',
      inputFocus: 'rgba(255, 255, 255, 0.20)',

      danger: '#ef4444',
      dangerMuted: 'rgba(239, 68, 68, 0.6)',
      success: '#22d3ee',
      successMuted: 'rgba(34, 211, 238, 0.6)',
      warning: '#f59e0b',
      warningMuted: 'rgba(245, 158, 11, 0.6)',
    },
    space: {
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      5: '20px',
      6: '24px',
      8: '32px',
      10: '40px',
      12: '48px',
      16: '64px',
    },
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    radii: {
      sm: '6px',
      md: '10px',
      lg: '14px',
      xl: '20px',
      full: '9999px',
    },
    shadows: {
      glass: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      glassHover: '0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      glow: '0 0 30px rgba(79, 143, 255, 0.15), 0 0 60px rgba(168, 85, 247, 0.10)',
      glowSoft: '0 0 20px rgba(79, 143, 255, 0.08)',
    },
  },
  utils: {
    p: (value: string) => ({
      paddingTop: value,
      paddingBottom: value,
      paddingLeft: value,
      paddingRight: value,
    }),
    px: (value: string) => ({
      paddingLeft: value,
      paddingRight: value,
    }),
    py: (value: string) => ({
      paddingTop: value,
      paddingBottom: value,
    }),
    m: (value: string) => ({
      marginTop: value,
      marginBottom: value,
      marginLeft: value,
      marginRight: value,
    }),
    mx: (value: string) => ({
      marginLeft: value,
      marginRight: value,
    }),
    my: (value: string) => ({
      marginTop: value,
      marginBottom: value,
    }),
    size: (value: string) => ({
      width: value,
      height: value,
    }),
    glassEffect: () => ({
      background: '$glassBg',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid $glassBorder',
    }),
    glassEffectStrong: () => ({
      background: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(24px) saturate(200%)',
      WebkitBackdropFilter: 'blur(24px) saturate(200%)',
      border: '1px solid rgba(255, 255, 255, 0.14)',
    }),
  },
  media: {
    sm: '(min-width: 640px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
  },
})

export const auroraFlow = keyframes({
  '0%, 100%': {
    transform: 'translateX(-10%) translateY(0%) skewX(-3deg) scale(1)',
    opacity: '0.6',
  },
  '25%': {
    transform: 'translateX(5%) translateY(-5%) skewX(2deg) scale(1.05)',
    opacity: '0.8',
  },
  '50%': {
    transform: 'translateX(10%) translateY(3%) skewX(-2deg) scale(1.02)',
    opacity: '0.55',
  },
  '75%': {
    transform: 'translateX(-5%) translateY(-3%) skewX(3deg) scale(1.04)',
    opacity: '0.7',
  },
})

export const auroraPulse = keyframes({
  '0%, 100%': { opacity: '0.5' },
  '50%': { opacity: '0.9' },
})

export const float = keyframes({
  '0%, 100%': {
    transform: 'translateY(0)',
  },
  '50%': {
    transform: 'translateY(-6px)',
  },
})

export const shimmer = keyframes({
  '0%': {
    backgroundPosition: '-200% 0',
  },
  '100%': {
    backgroundPosition: '200% 0',
  },
})

export const fadeIn = keyframes({
  '0%': { opacity: '0', transform: 'translateY(8px)' },
  '100%': { opacity: '1', transform: 'translateY(0)' },
})

export const glassButtonStyles = css({
  position: 'relative',
  background: '$glassBg',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid $glassBorder',
  color: '$foreground',
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  
  '&::before': {
    content: '',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
  },

  '&:hover': {
    background: '$glassBgHover',
    borderColor: '$glassBorderHover',
    boxShadow: '$glassHover',
    transform: 'translateY(-1px)',
  },

  '&:active': {
    transform: 'translateY(0)',
    boxShadow: '$glass',
  },
})

export const glassCardStyles = css({
  background: '$glassBg',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid $glassBorder',
  borderRadius: '$lg',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '$glass',

  '&::before': {
    content: "''",
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
  },

  '&:hover': {
    background: '$glassBgHover',
    borderColor: '$glassBorderHover',
    boxShadow: '$glassHover',
    transform: 'translateY(-2px)',
  },
})

export const glassInputStyles = css({
  background: '$input',
  backdropFilter: 'blur(16px) saturate(180%)',
  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
  border: '1px solid $inputBorder',
  color: '$foreground',
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  borderRadius: '$md',

  '&:focus': {
    borderColor: '$inputFocus',
    boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.06), $glowSoft',
    outline: 'none',
    background: 'rgba(255, 255, 255, 0.07)',
  },

  '&::placeholder': {
    color: '$foregroundSubtle',
  },
})

export const statusStyles = {
  todo: css({
    borderColor: 'rgba(79, 143, 255, 0.3)',
    
    '&:hover': {
      borderColor: 'rgba(79, 143, 255, 0.5)',
      boxShadow: '0 0 20px rgba(79, 143, 255, 0.10)',
    },
  }),
  in_progress: css({
    borderColor: 'rgba(168, 85, 247, 0.3)',
    
    '&:hover': {
      borderColor: 'rgba(168, 85, 247, 0.5)',
      boxShadow: '0 0 20px rgba(168, 85, 247, 0.10)',
    },
  }),
  in_review: css({
    borderColor: 'rgba(245, 158, 11, 0.3)',
    
    '&:hover': {
      borderColor: 'rgba(245, 158, 11, 0.5)',
      boxShadow: '0 0 20px rgba(245, 158, 11, 0.10)',
    },
  }),
  done: css({
    borderColor: 'rgba(34, 211, 238, 0.3)',
    
    '&:hover': {
      borderColor: 'rgba(34, 211, 238, 0.5)',
      boxShadow: '0 0 20px rgba(34, 211, 238, 0.10)',
    },
  }),
}

export const globalStyles = globalCss({
  '*': {
    boxSizing: 'border-box',
    margin: 0,
    padding: 0,
  },
  
  'html, body': {
    backgroundColor: '$background',
    color: '$foreground',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    scrollBehavior: 'smooth',
    overflowX: 'hidden',
  },
  
  '::-webkit-scrollbar': {
    width: '6px',
    height: '6px',
  },
  
  '::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  
  '::-webkit-scrollbar-thumb': {
    background: 'rgba(255, 255, 255, 0.12)',
    borderRadius: '$full',
    
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.2)',
    },
  },
  
  '::selection': {
    background: 'rgba(79, 143, 255, 0.3)',
    color: '$foreground',
  },
  
  'a': {
    color: '$primaryMuted',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    
    '&:hover': {
      color: '$primary',
    },
  },
})
