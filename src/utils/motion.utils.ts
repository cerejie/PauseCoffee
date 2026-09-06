/// A customer who has asked their phone to calm down gets the same behaviour
/// with none of the travel: every scripted scroll in the app routes its
/// `behavior` through here rather than hardcoding "smooth".
export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const scrollBehavior = (): ScrollBehavior =>
  prefersReducedMotion() ? "auto" : "smooth";
