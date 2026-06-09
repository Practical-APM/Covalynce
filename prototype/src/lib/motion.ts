/** Motion tokens — GPU-friendly (transform/opacity), calm premium easing */

export const easeOut = [0.16, 1, 0.3, 1] as const;
export const easeOutExpo = [0.19, 1, 0.22, 1] as const;

/** Hover / micro-interactions */
export const springSnappy = {
  type: "spring" as const,
  stiffness: 320,
  damping: 34,
  mass: 0.65,
};

/** Scroll reveals & parallax follow — low bounce, high damping */
export const springButtery = {
  type: "spring" as const,
  stiffness: 95,
  damping: 28,
  mass: 0.9,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const tweenReveal = {
  duration: 0.72,
  ease: easeOutExpo,
};

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { ...tweenReveal, delay: i * 0.06 },
  }),
};

/** Hero entrance — no blur (keeps compositing smooth) */
export const heroReveal = {
  hidden: { opacity: 0, y: 22 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.08, ease: easeOutExpo },
  }),
};

export const fadeUpLite = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOutExpo },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: tweenReveal,
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: tweenReveal,
  },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: tweenReveal,
  },
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: tweenReveal,
  },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};
