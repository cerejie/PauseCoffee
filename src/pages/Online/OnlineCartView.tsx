import { ArrowLeftOutlined, ClockCircleOutlined, CoffeeOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import CartLines from "../../components/cart/views/CartLines";
import EmptyState from "../../components/common/state/EmptyState";
import OnlineCheckoutSummary from "../../components/online/views/OnlineCheckoutSummary";
import { useCartHook } from "../../hook/data/cart/cart.hook";
import { useOnlineChannelHook } from "../../hook/data/online/online.channel.hook";
import { useOnlineOrderFormHook } from "../../hook/data/online/online.order.form.hook";
import { empty, layout } from "../../styles/cart/cart.css";
import { closedBanner, closedBody, closedTitle } from "../../styles/online/online.css";
import {
  backLink,
  pageHead,
  pageSubtitle,
  pageTitle,
} from "../../styles/layout/customer.layout.css";

const OnlineCartView = () => {
  const navigate = useNavigate();
  const { basePath } = useOnlineChannelHook();
  const { lines, itemCount } = useCartHook();
  const checkout = useOnlineOrderFormHook();

  const isShut = !checkout.storefront.isOnlineOrderingOpen;

  return (
    <>
      <div className={pageHead}>
        <div>
          <button
            type="button"
            className={backLink}
            onClick={() => navigate(basePath)}
          >
            <ArrowLeftOutlined /> Back to menu
          </button>
          <h1 className={pageTitle}>Checkout</h1>
          <p className={pageSubtitle}>
            {itemCount === 0
              ? "Nothing here yet."
              : `${itemCount} ${itemCount === 1 ? "drink" : "drinks"} — pay online and we'll confirm it.`}
          </p>
        </div>
      </div>

      {/* Repeated from the menu on purpose: someone who deep-linked straight to
          checkout has not seen the other one, and this is the screen where not
          knowing costs them a real transfer. */}
      {isShut ? (
        <div className={closedBanner}>
          <ClockCircleOutlined style={{ fontSize: 17, marginTop: 2 }} />
          <div>
            <p className={closedTitle}>Online ordering is closed</p>
            <p className={closedBody}>
              Please don't send any payment yet — we can't accept the order until
              we're back open.
            </p>
          </div>
        </div>
      ) : null}

      {lines.length === 0 ? (
        <div className={empty}>
          <EmptyState
            icon={<CoffeeOutlined />}
            title="Your cart is empty"
            description="Add a drink from the menu and it'll show up here."
            action={
              <Button type="primary" size="large" onClick={() => navigate(basePath)}>
                Browse the menu
              </Button>
            }
          />
        </div>
      ) : (
        <div className={layout}>
          <CartLines />
          <OnlineCheckoutSummary checkout={checkout} />
        </div>
      )}
    </>
  );
};

export default OnlineCartView;
