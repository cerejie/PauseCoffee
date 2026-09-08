/// A customer who has asked their phone to calm down gets the same behaviour
/// with none of the travel: every scripted scroll in the app routes its
/// `behavior` through here rather than hardcoding "smooth".
export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const scrollBehavior = (): ScrollBehavior =>
  prefersReducedMotion() ? "auto" : "smooth";

/// Walks a list in on load. Capped at ten so a long menu does not make the last
/// card wait a second and a half to appear.
///
/// Lives here rather than beside the keyframes it drives because a
/// vanilla-extract stylesheet may only export plain values — a function export
/// fails the build with "Invalid exports".
export const staggerDelay = (index: number): { animationDelay: string } => ({
  animationDelay: `${Math.min(index, 9) * 45}ms`,
});
