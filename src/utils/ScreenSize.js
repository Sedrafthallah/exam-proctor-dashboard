export const breakpoints = {
  xs: 576,
  md: 768,
  lg: 1024,
};

export const mediaQuery = {
  xs: `(max-width: ${breakpoints.xs - 1}px)`,
  md: `(min-width: ${breakpoints.md}px)`,
  lg: `(min-width: ${breakpoints.lg}px)`,
};
