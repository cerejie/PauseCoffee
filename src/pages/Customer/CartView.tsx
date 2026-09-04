import { ArrowLeftOutlined, CoffeeOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CartLineCard from "../../components/cart/cards/CartLineCard";
import CheckoutSummary from "../../components/cart/views/CheckoutSummary";
import EmptyState from "../../components/common/state/EmptyState";
import ProductOptionsDrawer from "../../components/menu/modal/ProductOptionsDrawer";
import { useCartHook } from "../../hook/data/cart/cart.hook";
import { useMenuListHook } from "../../hook/data/menu/menu.list.hook";
import { useOrderFormHook } from "../../hook/data/order/order.form.hook";
import { useProductOptionsHook } from "../../hook/data/menu/product.options.hook";
import type { ICartLine } from "../../models/data/order/cart.model";
import { empty, layout, lineList } from "../../styles/cart/cart.css";
import {
  backLink,
  pageHead,
  pageSubtitle,
  pageTitle,
} from "../../styles/layout/customer.layout.css";

const CartView = () => {
  const navigate = useNavigate();
  const { lines, itemCount, setQuantity, removeLine, lineTotal } = useCartHook();
  const { allSections } = useMenuListHook();
  const checkout = useOrderFormHook();
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
      <div className={pageHead}>
        <div>
          <button type="button" className={backLink} onClick={() => navigate("/")}>
            <ArrowLeftOutlined /> Back to menu
          </button>
          <h1 className={pageTitle}>Your cart</h1>
          <p className={pageSubtitle}>
            {itemCount === 0
              ? "Nothing here yet."
              : `${itemCount} ${itemCount === 1 ? "drink" : "drinks"} ready to send.`}
          </p>
        </div>
      </div>

      {lines.length === 0 ? (
        <div className={empty}>
          <EmptyState
            icon={<CoffeeOutlined />}
            title="Your cart is empty"
            description="Add a drink from the menu and it'll show up here."
            action={
              <Button type="primary" size="large" onClick={() => navigate("/")}>
                Browse the menu
              </Button>
            }
          />
        </div>
      ) : (
        <div className={layout}>
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

          <CheckoutSummary checkout={checkout} />
        </div>
      )}

      <ProductOptionsDrawer options={options} />
    </>
  );
};

export default CartView;
