import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { scrollBehavior } from "../../../utils/motion.utils";

/// How far a section's heading has to clear the docked rail before it counts as
/// the one being read. Without the slack the rail flips a hair early and the
/// chip disagrees with the heading the customer is looking at.
const ACTIVATION_SLACK = 16;

/// A tapped chip owns the rail until the page arrives — or until this runs out,
/// in case the target was already as far down as the page can scroll.
const TRAVEL_GRACE_MS = 1500;

interface UseCategoryScrollParams {
  /// Section slugs in menu order. Changing the group or the search rebuilds
  /// this, which is what re-seeds the spy.
  readonly slugs: readonly string[];
  /// The sticky rail. Its own bottom edge is the line that decides which
  /// section is current, so the two can never drift apart the way a hardcoded
  /// `rootMargin` does.
  readonly railRef: RefObject<HTMLElement | null>;
  readonly setActiveSlug: (slug: string | null) => void;
}

/// Keeps the category rail honest about where the page is, and drives the jump
/// when a chip is tapped. Both directions measure against the same edge.
export const useCategoryScrollHook = ({
  slugs,
  railRef,
  setActiveSlug,
}: UseCategoryScrollParams) => {
  const [pinned, setPinned] = useState(false);

  /// The chip the customer just tapped. Every section between here and there
  /// streams past during the smooth scroll; without this the rail would flicker
  /// through each of them on the way.
  const travellingTo = useRef<{ slug: string; expires: number } | null>(null);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || slugs.length === 0) return;

    let frame = 0;
    let stickyTop = 0;
    let lastSlug: string | null = null;
    let lastPinned: boolean | null = null;

    let sections = slugs
      .map((slug) => ({ slug, element: document.getElementById(`section-${slug}`) }))
      .filter((entry): entry is { slug: string; element: HTMLElement } =>
        Boolean(entry.element),
      );

    /// The rail's own `top`, resolved from the header-height var. Read once per
    /// layout change rather than once per scroll frame.
    const readStickyTop = () => {
      const value = Number.parseFloat(window.getComputedStyle(rail).top);
      stickyTop = Number.isFinite(value) ? value : 0;
    };

    const measure = () => {
      frame = 0;
      if (sections.length === 0) return;

      const railBox = rail.getBoundingClientRect();
      const isPinned = railBox.top <= stickyTop + 1;

      /// The last section is usually shorter than the screen, so its heading
      /// never reaches the rail and a top-down scan alone would leave the rail
      /// stuck one category behind. Hitting the bottom of the page means the
      /// last section is what is on screen, whatever the arithmetic says.
      const atBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2;

      let next = atBottom ? sections[sections.length - 1].slug : sections[0].slug;

      if (!atBottom) {
        for (const entry of sections) {
          if (entry.element.getBoundingClientRect().top - ACTIVATION_SLACK > railBox.bottom)
            break;
          next = entry.slug;
        }
      }

      const target = travellingTo.current;
      if (target) {
        if (next === target.slug || performance.now() > target.expires)
          travellingTo.current = null;
        else next = target.slug;
      }

      if (next !== lastSlug) {
        lastSlug = next;
        setActiveSlug(next);
      }

      if (isPinned !== lastPinned) {
        lastPinned = isPinned;
        setPinned(isPinned);
      }
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    const relayout = () => {
      readStickyTop();
      sections = slugs
        .map((slug) => ({ slug, element: document.getElementById(`section-${slug}`) }))
        .filter((entry): entry is { slug: string; element: HTMLElement } =>
          Boolean(entry.element),
        );
      schedule();
    };

    /// A customer who starts scrolling mid-jump has changed their mind — hand
    /// the rail straight back rather than holding the tapped chip lit.
    const release = () => {
      travellingTo.current = null;
      schedule();
    };

    readStickyTop();
    schedule();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", relayout);
    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchmove", release, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", relayout);
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchmove", release);
    };
  }, [slugs, railRef, setActiveSlug]);

  const scrollToSection = useCallback(
    (slug: string) => {
      const element = document.getElementById(`section-${slug}`);
      if (!element) return;

      setActiveSlug(slug);
      travellingTo.current = { slug, expires: performance.now() + TRAVEL_GRACE_MS };

      /// Land the heading just under where the rail will be once it docks —
      /// the same edge the spy reads back, so the chip that was tapped is the
      /// chip that stays lit when the page settles.
      const rail = railRef.current;
      let chrome = 0;
      if (rail) {
        const top = Number.parseFloat(window.getComputedStyle(rail).top);
        chrome = (Number.isFinite(top) ? top : 0) + rail.offsetHeight;
      }

      window.scrollTo({
        top: Math.max(window.scrollY + element.getBoundingClientRect().top - chrome - 8, 0),
        behavior: scrollBehavior(),
      });
    },
    [railRef, setActiveSlug],
  );

  return { pinned, scrollToSection };
};
