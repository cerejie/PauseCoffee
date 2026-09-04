import { useAccentVars } from "../../../hook/common/accent.hook";
import type { IMenuSection, IProduct } from "../../../models/data/menu/menu.response";
import ProductCard from "../cards/ProductCard";
import {
  grid,
  section as sectionClass,
  sectionCount,
  sectionHead,
  sectionRule,
  sectionTagline,
  sectionTitle,
} from "../../../styles/menu/menu.css";

interface MenuSectionProps {
  section: IMenuSection;
  onSelectProduct: (product: IProduct, section: IMenuSection) => void;
}

const MenuSection = ({ section, onSelectProduct }: MenuSectionProps) => {
  const accentVars = useAccentVars(section.accent_color);

  return (
    <section
      id={`section-${section.slug}`}
      className={sectionClass}
      style={accentVars}
      aria-labelledby={`heading-${section.slug}`}
    >
      <div className={sectionHead}>
        <h2 id={`heading-${section.slug}`} className={sectionTitle}>
          {section.name}
        </h2>
        <span className={sectionRule} />
        <span className={sectionCount}>{section.products.length}</span>
      </div>

      {section.tagline ? <p className={sectionTagline}>{section.tagline}</p> : null}

      <div className={grid}>
        {section.products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            section={section}
            onSelect={(next) => onSelectProduct(next, section)}
          />
        ))}
      </div>
    </section>
  );
};

export default MenuSection;
