import { PlusOutlined } from "@ant-design/icons";
import ProductImage from "../../common/media/ProductImage";
import { useAccentVars } from "../../../hook/common/accent.hook";
import { useStorefrontDiscountHook } from "../../../hook/data/settings/settings.hook";
import type { IMenuSection, IProduct } from "../../../models/data/menu/menu.response";
import { discountedPrice, discountLabel } from "../../../utils/discount.utils";
import { formatPeso } from "../../../utils/formatter.utils";
import { visuallyHidden } from "../../../styles/common/global.css";
import {
  card,
  cardAdd,
  cardBadge,
  cardBody,
  cardDescription,
  cardDiscountTag,
  cardFoot,
  cardPrice,
  cardPriceBlock,
  cardPriceLabel,
  cardPriceRow,
  cardPriceTop,
  cardPriceWas,
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

  // The cheapest size stays the cheapest after a uniform discount, so the
  // "from" floor is simply discounted too.
  const discount = useStorefrontDiscountHook();
  const price = discountedPrice(cheapest, discount);
  const isDiscounted = price < cheapest;

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
            <span className={cardPriceTop}>
              <span className={cardPriceLabel}>
                {sizes.length > 1 ? "from" : sizes[0]?.label}
              </span>
              {isDiscounted && discount ? (
                <span className={cardDiscountTag}>{discountLabel(discount)}</span>
              ) : null}
            </span>
            <span className={cardPriceRow}>
              <span className={cardPrice}>{formatPeso(price)}</span>
              {isDiscounted ? (
                <s className={cardPriceWas}>
                  <span className={visuallyHidden}>was </span>
                  {formatPeso(cheapest)}
                </s>
              ) : null}
            </span>
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
