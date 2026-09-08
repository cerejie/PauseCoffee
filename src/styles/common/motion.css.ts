import { keyframes, style } from "@vanilla-extract/css";

/// Shared motion. One place, so the app moves at one speed and in one
/// direction — things enter by rising a little and settling, nothing spins,
/// nothing bounces.
///
/// Every class here disappears under `prefers-reduced-motion`. That is not a
/// nicety: an animation that cannot be turned off is a barrier for anyone with
/// a vestibular disorder, and this app is used one-handed on a phone.

export const easeOut = "cubic-bezier(0.22, 0.61, 0.36, 1)";
export const easeSpring = "cubic-bezier(0.34, 1.26, 0.64, 1)";

export const riseIn = keyframes({
  from: { opacity: 0, transform: "translate3d(0, 12px, 0)" },
  to: { opacity: 1, transform: "translate3d(0, 0, 0)" },
});

export const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

/// A chat bubble arriving. Slightly under-scaled so it reads as landing rather
/// than sliding — the one place in the app where a little spring is right.
export const bubbleIn = keyframes({
  from: { opacity: 0, transform: "translate3d(0, 10px, 0) scale(0.96)" },
  to: { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
});

export const typingBlink = keyframes({
  "0%, 60%, 100%": { opacity: 0.25, transform: "translateY(0)" },
  "30%": { opacity: 1, transform: "translateY(-3px)" },
});

const reduce = {
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animation: "none",
      transition: "none",
      opacity: 1,
      transform: "none",
    },
  },
} as const;

export const rise = style({
  animation: `${riseIn} 320ms ${easeOut} both`,
  ...reduce,
});

export const fade = style({
  animation: `${fadeIn} 240ms ${easeOut} both`,
  ...reduce,
});

export const bubble = style({
  animation: `${bubbleIn} 260ms ${easeSpring} both`,
  ...reduce,
});

/// Interactive surfaces: a small, quick lift on hover and a real press. Applied
/// to cards and tiles that already look tappable, never to plain text.
export const pressable = style({
  transition: `transform 160ms ${easeOut}, box-shadow 160ms ${easeOut}, border-color 160ms ${easeOut}`,
  selectors: {
    "&:hover": { transform: "translateY(-2px)" },
    "&:active": { transform: "translateY(0) scale(0.99)" },
  },
  ...reduce,
});
