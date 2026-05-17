/** Shared Framer Motion presets for consistent interactive hover feel. */

export const cardHover = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -6,
    scale: 1.02,
    transition: { type: 'spring', stiffness: 420, damping: 22 },
  },
  tap: { scale: 0.98, y: -2 },
}

export const iconPop = {
  rest: { scale: 1, rotate: 0 },
  hover: {
    scale: 1.12,
    rotate: 6,
    transition: { type: 'spring', stiffness: 500, damping: 18 },
  },
}

export const statPop = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: { type: 'spring', stiffness: 400, damping: 20 },
  },
}

export const buttonPop = {
  whileHover: { scale: 1.05, y: -2 },
  whileTap: { scale: 0.96 },
}

export const fabPop = {
  whileHover: { scale: 1.1, rotate: 8 },
  whileTap: { scale: 0.92 },
}
