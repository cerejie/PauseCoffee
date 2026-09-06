import { PlusOutlined } from "@ant-design/icons";
import ProductImage from "../../common/media/ProductImage";
import { useAccentVars } from "../../../hook/common/accent.hook";
import type { IMenuSection, IProduct } from "../../../models/data/menu/menu.response";
import { formatPeso } from "../../../utils/formatter.utils";
import {
  card,
  cardAdd,
  cardBadge,
  cardBody,
  cardDescription,
  cardFoot,
  cardPrice,
  cardPriceBlock,
  cardPriceLabel,
  cardTitle,
} from "../../../styles/menu/menu.css";
import { mediaCard } from "../../../styles/common/media.css";

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
      <ProductImage src={product.image_url} alt={product.name} className={mediaCard} />

      <span className={cardBody}>
        {product.badge ? <span className={cardBadge}>{product.badge}</span> : null}

        <span className={cardTitle}>{product.name}</span>

        {product.description ? (
          <span className={cardDescription}>{product.description}</span>
        ) : null}

        <span className={cardFoot}>
          <span className={cardPriceBlock}>
            {/* One size is a fact — "12 oz". Several is a floor, and the
                drawer is where the customer picks which one. */}
            <span className={cardPriceLabel}>
              {sizes.length > 1 ? "from" : sizes[0]?.label}
            </span>
            <span className={cardPrice}>{formatPeso(cheapest)}</span>
          </span>

          <span className={cardAdd}>
            <PlusOutlined />
          </span>
        </span>
      </span>
    </button>
  );
};

export default ProductCard;
