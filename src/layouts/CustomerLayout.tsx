import { ArrowRightOutlined, ShoppingOutlined } from "@ant-design/icons";
import { Badge } from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import BrandMark from "../components/common/brand/BrandMark";
import { useCartHook } from "../hook/data/cart/cart.hook";
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

const CustomerLayout = () => {
  const { lines, itemCount, subtotal } = useCartHook();
  const navigate = useNavigate();
  const location = useLocation();

  // The bar is the cart's only entry point on a phone, so it must not sit on
  // top of the cart or the tracker it would navigate to.
  const showCartBar = lines.length > 0 && location.pathname === "/";

  return (
    <div className={shell}>
      <header className={header}>
        <Link to="/" className={brandMark} aria-label="Pause Coffee home">
          <BrandMark />
        </Link>

        <div className={headerActions}>
          <Badge count={itemCount} size="small" offset={[-4, 4]} color="#3B2317">
            <button
              type="button"
              className={iconButton}
              onClick={() => navigate("/cart")}
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
        <button type="button" className={cartBar} onClick={() => navigate("/cart")}>
          <span className={cartBarMeta}>
            <span className={cartBarCount}>
              {itemCount} {itemCount === 1 ? "drink" : "drinks"}
            </span>
            <span className={cartBarTotal}>{formatPeso(subtotal)}</span>
          </span>
          <span className={cartBarAction}>
            View cart <ArrowRightOutlined />
          </span>
        </button>
      )}
    </div>
  );
};

export default CustomerLayout;
