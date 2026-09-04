import { useAccentVars } from "../../../hook/common/accent.hook";
import type { IMenuSection } from "../../../models/data/menu/menu.response";
import {
  rail,
  railChip,
  railChipActive,
  railDot,
  railDotActive,
} from "../../../styles/menu/menu.css";

interface CategoryRailProps {
  sections: IMenuSection[];
  activeSlug: string | null;
  onSelect: (slug: string) => void;
}

const RailChip = ({
  section,
  active,
  onSelect,
}: {
  section: IMenuSection;
  active: boolean;
  onSelect: (slug: string) => void;
}) => {
  const accentVars = useAccentVars(section.accent_color);

  return (
    <button
      type="button"
      style={accentVars}
      className={active ? `${railChip} ${railChipActive}` : railChip}
      onClick={() => onSelect(section.slug)}
      aria-pressed={active}
    >
      <span className={active ? `${railDot} ${railDotActive}` : railDot} />
      {section.name}
    </button>
  );
};

/// Horizontal category pills. Selecting one scrolls the page to that section
/// rather than filtering, so the whole menu stays one continuous read.
const CategoryRail = ({ sections, activeSlug, onSelect }: CategoryRailProps) => (
  <nav className={rail} aria-label="Menu categories">
    {sections.map((section) => (
      <RailChip
        key={section.id}
        section={section}
        active={activeSlug === section.slug}
        onSelect={onSelect}
      />
    ))}
  </nav>
);

export default CategoryRail;
