import { useCallback, useEffect, useRef, type RefObject } from "react";
import { useAccentVars } from "../../../hook/common/accent.hook";
import type { IMenuSection } from "../../../models/data/menu/menu.response";
import {
  rail,
  railChip,
  railChipActive,
  railPinned,
  railTrack,
} from "../../../styles/menu/menu.css";
import { scrollBehavior } from "../../../utils/motion.utils";

interface CategoryRailProps {
  sections: IMenuSection[];
  activeSlug: string | null;
  onSelect: (slug: string) => void;
  /// Owned by the page: the spy measures the menu against this element's
  /// docked edge, and the rail scrolls itself sideways through it.
  railRef: RefObject<HTMLElement | null>;
  pinned: boolean;
}

const RailChip = ({
  section,
  active,
  onSelect,
  registerRef,
}: {
  section: IMenuSection;
  active: boolean;
  onSelect: (slug: string) => void;
  registerRef: (slug: string, element: HTMLButtonElement | null) => void;
}) => {
  const accentVars = useAccentVars(section.accent_color);

  return (
    <button
      type="button"
      ref={(element) => registerRef(section.slug, element)}
      style={accentVars}
      className={active ? `${railChip} ${railChipActive}` : railChip}
      onClick={() => onSelect(section.slug)}
      aria-pressed={active}
    >
      {section.name}
    </button>
  );
};

/// Horizontal category pills. Selecting one scrolls the page to that section
/// rather than filtering, so the whole menu stays one continuous read. Each
/// chip carries its own fill, and the rail scrolls itself so the current
/// category is always within thumb's reach — browsing down the menu is what
/// moves it.
const CategoryRail = ({
  sections,
  activeSlug,
  onSelect,
  railRef,
  pinned,
}: CategoryRailProps) => {
  const chipRefs = useRef(new Map<string, HTMLButtonElement>());

  const registerRef = useCallback((slug: string, element: HTMLButtonElement | null) => {
    if (element) chipRefs.current.set(slug, element);
    else chipRefs.current.delete(slug);
  }, []);

  /// Scrolling the menu can carry the current category off the end of the rail.
  /// Bringing it back to the middle keeps its neighbours one tap away, which is
  /// the whole reason the rail is there.
  useEffect(() => {
    const container = railRef.current;
    const chip = activeSlug ? chipRefs.current.get(activeSlug) : undefined;
    if (!container || !chip) return;

    const containerBox = container.getBoundingClientRect();
    const chipBox = chip.getBoundingClientRect();
    const delta =
      chipBox.left - containerBox.left - (containerBox.width - chipBox.width) / 2;

    if (Math.abs(delta) < 2) return;

    container.scrollTo({
      left: container.scrollLeft + delta,
      behavior: scrollBehavior(),
    });
  }, [activeSlug, railRef]);

  // A search that matches nothing leaves no categories to rail between, and
  // an empty track is just a stray pill above the empty state.
  if (sections.length === 0) return null;

  return (
    <nav
      ref={railRef}
      className={pinned ? `${rail} ${railPinned}` : rail}
      aria-label="Menu categories"
    >
      <div className={railTrack}>
        {sections.map((section) => (
          <RailChip
            key={section.id}
            section={section}
            active={activeSlug === section.slug}
            onSelect={onSelect}
            registerRef={registerRef}
          />
        ))}
      </div>
    </nav>
  );
};

export default CategoryRail;
