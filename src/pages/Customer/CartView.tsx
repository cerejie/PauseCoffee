import { ArrowLeftOutlined, CoffeeOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import CartLines from "../../components/cart/views/CartLines";
import CheckoutSummary from "../../components/cart/views/CheckoutSummary";
import EmptyState from "../../components/common/state/EmptyState";
import { useCartHook } from "../../hook/data/cart/cart.hook";
import { useOrderFormHook } from "../../hook/data/order/order.form.hook";
import { empty, layout } from "../../styles/cart/cart.css";
import {
  backLink,
  pageHead,
  pageSubtitle,
  pageTitle,
} from "../../styles/layout/customer.layout.css";

const CartView = () => {
  const navigate = useNavigate();
  const { lines, itemCount } = useCartHook();
  const checkout = useOrderFormHook();

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
          <CartLines />
          <CheckoutSummary checkout={checkout} />
        </div>
      )}
    </>
  );
};

export default CartView;
