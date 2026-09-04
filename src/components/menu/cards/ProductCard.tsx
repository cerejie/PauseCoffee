import { PlusOutlined } from "@ant-design/icons";
import { useAccentVars } from "../../../hook/common/accent.hook";
import type { IMenuSection, IProduct } from "../../../models/data/menu/menu.response";
import { formatPeso } from "../../../utils/formatter.utils";
import {
  card,
  cardAdd,
  cardBadge,
  cardBody,
  cardDescription,
  cardPrice,
  cardPriceLabel,
  cardSizeChip,
  cardSizes,
  cardTail,
  cardTitle,
  cardTitleRow,
} from "../../../styles/menu/menu.css";

interface ProductCardProps {
  product: IProduct;
  section: IMenuSection;
  onSelect: (product: IProduct) => void;
}

const ProductCard = ({ product, section, onSelect }: ProductCardProps) => {
  const accentVars = useAccentVars(section.accent_color);

  const sizes = product.product_sizes.filter((size) => size.is_active);
  const cheapest = sizes.reduce(
    (low, size) => (Number(size.price) < low ? Number(size.price) : low),
    Number(sizes[0]?.price ?? 0),
  );

  return (
    <button
      type="button"
      className={card}
      style={accentVars}
      onClick={() => onSelect(product)}
    >
      <span className={cardBody}>
        <span className={cardTitleRow}>
          <span className={cardTitle}>{product.name}</span>
          {product.badge ? <span className={cardBadge}>{product.badge}</span> : null}
        </span>

        {product.description ? (
          <span className={cardDescription}>{product.description}</span>
        ) : null}

        {/* Only worth showing when there is a choice to make. */}
        {sizes.length > 1 ? (
          <span className={cardSizes}>
            {sizes.map((size) => (
              <span key={size.id} className={cardSizeChip}>
                {size.label} · {formatPeso(size.price)}
              </span>
            ))}
          </span>
        ) : null}
      </span>

      <span className={cardTail}>
        <span style={{ textAlign: "right" }}>
          <span className={cardPriceLabel}>
            {sizes.length > 1 ? "from" : sizes[0]?.label}
          </span>
          <span className={cardPrice} style={{ display: "block", marginTop: 2 }}>
            {formatPeso(cheapest)}
          </span>
        </span>
        <span className={cardAdd}>
          <PlusOutlined />
        </span>
      </span>
    </button>
  );
};

export default ProductCard;
