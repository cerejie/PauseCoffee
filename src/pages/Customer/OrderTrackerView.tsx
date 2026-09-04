import { CoffeeOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Result } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import BrandLoader from "../../components/common/loader/BrandLoader";
import OrderProgress from "../../components/order/views/OrderProgress";
import OrderReceipt from "../../components/order/views/OrderReceipt";
import { OrderStatusEnum, orderTypeLabel } from "../../enums/order.enum";
import { useOrderStatusHook } from "../../hook/data/order/order.status.hook";
import { formatTime } from "../../utils/formatter.utils";
import {
  actions,
  claimCard,
  claimCode,
  claimLabel,
  claimMeta,
  claimMetaItem,
  claimMetaLabel,
  claimMetaValue,
  claimName,
  ghostButton,
  layout,
  primaryButton,
} from "../../styles/order/tracker.css";
import { pageHead, pageSubtitle, pageTitle } from "../../styles/layout/customer.layout.css";

const OrderTrackerView = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { order, steps, isLoading, isError, refetch, isCancelled } =
    useOrderStatusHook(orderId);

  if (isLoading) return <BrandLoader label="Finding your order" />;

  if (isError || !order) {
    return (
      <Result
        status="404"
        title="We can't find that order"
        subTitle="The link may be from another device, or the order was removed."
        extra={
          <Button type="primary" onClick={() => navigate("/")}>
            Back to the menu
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className={pageHead}>
        <div>
          <h1 className={pageTitle}>
            {isCancelled
              ? "This order was cancelled"
              : order.status === OrderStatusEnum.Ready
                ? "Your drink is ready"
                : "Thanks, we're on it"}
          </h1>
          <p className={pageSubtitle}>
            {isCancelled
              ? order.cancel_reason ?? "Please talk to the counter for a refund or a redo."
              : "Show this code at the counter when you collect."}
          </p>
        </div>
      </div>

      <div className={layout}>
        <div>
          <div className={claimCard}>
            <span className={claimLabel}>Claim code</span>
            <div className={claimCode}>{order.order_number}</div>
            <div className={claimName}>for {order.customer_name}</div>

            <div className={claimMeta}>
              <div className={claimMetaItem}>
                <span className={claimMetaLabel}>Placed</span>
                <span className={claimMetaValue}>{formatTime(order.placed_at)}</span>
              </div>
              <div className={claimMetaItem}>
                <span className={claimMetaLabel}>Type</span>
                <span className={claimMetaValue}>{orderTypeLabel[order.order_type]}</span>
              </div>
              <div className={claimMetaItem}>
                <span className={claimMetaLabel}>Items</span>
                <span className={claimMetaValue}>{order.item_count}</span>
              </div>
            </div>
          </div>

          {!isCancelled && (
            <OrderProgress
              steps={steps}
              queuePosition={order.queue_position}
              status={order.status}
            />
          )}

          <div className={actions}>
            <button
              type="button"
              className={ghostButton}
              onClick={() => void refetch()}
            >
              <ReloadOutlined /> Refresh
            </button>
            <button
              type="button"
              className={primaryButton}
              onClick={() => navigate("/")}
            >
              <CoffeeOutlined /> Order something else
            </button>
          </div>
        </div>

        <OrderReceipt items={order.items} total={order.total} />
      </div>
    </>
  );
};

export default OrderTrackerView;
