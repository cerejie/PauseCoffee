import { useCallback } from "react";
import CartLineCard from "../cards/CartLineCard";
import ProductOptionsDrawer from "../../menu/modal/ProductOptionsDrawer";
import { useCartHook } from "../../../hook/data/cart/cart.hook";
import { useMenuListHook } from "../../../hook/data/menu/menu.list.hook";
import { useProductOptionsHook } from "../../../hook/data/menu/product.options.hook";
import type { ICartLine } from "../../../models/data/order/cart.model";
import { lineList } from "../../../styles/cart/cart.css";

/// The editable list of what is in the cart, plus the drawer that edits it.
/// Identical at the counter and online — only the panel beside it differs —
/// so it lives here rather than in either cart page.
const CartLines = () => {
  const { lines, setQuantity, removeLine, lineTotal } = useCartHook();
  const { allSections } = useMenuListHook();
  const options = useProductOptionsHook();

  /// Editing needs the live product and its category back — the cart line only
  /// stores what it needs to render, not the whole menu row.
  const editLine = useCallback(
    (line: ICartLine) => {
      const section = allSections.find((entry) => entry.id === line.categoryId);
      const product = section?.products.find((entry) => entry.id === line.productId);
      if (!section || !product) return;

      options.open({ product, section, editing: line });
    },
    [allSections, options],
  );

  return (
    <>
      <div className={lineList}>
        {lines.map((line) => (
          <CartLineCard
            key={line.key}
            line={line}
            total={lineTotal(line)}
            onQuantity={(quantity) => setQuantity(line.key, quantity)}
            onEdit={() => editLine(line)}
            onRemove={() => removeLine(line.key)}
          />
        ))}
      </div>

      <ProductOptionsDrawer options={options} />
    </>
  );
};

export default CartLines;
