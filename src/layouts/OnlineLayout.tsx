import { ArrowRightOutlined, ShoppingOutlined } from "@ant-design/icons";
import { Badge } from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import BrandMark from "../components/common/brand/BrandMark";
import { useStickyHeaderHook } from "../hook/common/sticky.header.hook";
import { useCartHook } from "../hook/data/cart/cart.hook";
import { useOnlineChannelHook } from "../hook/data/online/online.channel.hook";
import { formatPeso } from "../utils/formatter.utils";
import {
  brandMark,
  cartBar,
  cartBarAction,
  cartBarCount,
  cartBarMeta,
  cartBarTotal,
  header,
  headerActions,
  iconButton,
  main,
  shell,
} from "../styles/layout/customer.layout.css";
import { channelChip } from "../styles/online/online.css";

/// The online app's frame. Deliberately the counter's layout with two changes:
/// every link is relative to the shop's chosen slug, and a chip says which app
/// you are in — the two are otherwise identical enough that a customer who has
/// used one recognises the other.
const OnlineLayout = () => {
  const { lines, itemCount, subtotal } = useCartHook();
  const { basePath, cartPath } = useOnlineChannelHook();
  const navigate = useNavigate();
  const location = useLocation();

  // The bar is the cart's only entry point on a phone, so it must not sit on
  // top of the cart it would navigate to.
  const showCartBar = lines.length > 0 && location.pathname === basePath;

  const { headerRef, headerVars } = useStickyHeaderHook();

  return (
    <div className={shell} style={headerVars}>
      <header ref={headerRef} className={header}>
        <Link to={basePath} className={brandMark} aria-label="Pause Coffee online">
          <BrandMark />
        </Link>

        <div className={headerActions}>
          <span className={channelChip}>Order online</span>

          <Badge count={itemCount} size="small" offset={[-4, 4]} color="#3B2317">
            <button
              type="button"
              className={iconButton}
              onClick={() => navigate(cartPath)}
              aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
            >
              <ShoppingOutlined />
            </button>
          </Badge>
        </div>
      </header>

      <main className={main}>
        <Outlet />
      </main>

      {showCartBar && (
        <button type="button" className={cartBar} onClick={() => navigate(cartPath)}>
          <span className={cartBarMeta}>
            <span className={cartBarCount}>
              {itemCount} {itemCount === 1 ? "drink" : "drinks"}
            </span>
            <span className={cartBarTotal}>{formatPeso(subtotal)}</span>
          </span>
          <span className={cartBarAction}>
            Checkout <ArrowRightOutlined />
          </span>
        </button>
      )}
    </div>
  );
};

export default OnlineLayout;
