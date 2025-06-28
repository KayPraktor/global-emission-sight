
// Design System Tokens
export const designTokens = {
  // Advanced Typography Scale
  typography: {
    display: {
      xs: { fontSize: '2.25rem', lineHeight: '2.5rem', fontWeight: '700' },
      sm: { fontSize: '3rem', lineHeight: '3rem', fontWeight: '700' },
      md: { fontSize: '3.75rem', lineHeight: '3.75rem', fontWeight: '700' },
      lg: { fontSize: '4.5rem', lineHeight: '4.5rem', fontWeight: '800' },
      xl: { fontSize: '6rem', lineHeight: '6rem', fontWeight: '800' },
    },
    heading: {
      xs: { fontSize: '1.125rem', lineHeight: '1.75rem', fontWeight: '600' },
      sm: { fontSize: '1.25rem', lineHeight: '1.75rem', fontWeight: '600' },
      md: { fontSize: '1.5rem', lineHeight: '2rem', fontWeight: '600' },
      lg: { fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: '600' },
      xl: { fontSize: '2.25rem', lineHeight: '2.5rem', fontWeight: '700' },
    }
  },

  // Data Visualization Color Scales
  colors: {
    data: {
      primary: ['#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1'],
      secondary: ['#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a'],
      accent: ['#fefce8', '#fef3c7', '#fde68a', '#fcd34d', '#f59e0b', '#d97706', '#b45309'],
      danger: ['#fef2f2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c'],
      neutral: ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569']
    },
    status: {
      success: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
      warning: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
      error: { bg: '#fecaca', text: '#991b1b', border: '#fca5a5' },
      info: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' }
    }
  },

  // Advanced Spacing System (8px grid)
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
    '4xl': '6rem',    // 96px
    '5xl': '8rem',    // 128px
  },

  // Shadow System for Depth
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },

  // Animation Durations
  animation: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '750ms',
  },

  // Border Radius Scale
  radius: {
    xs: '0.125rem',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  }
};
