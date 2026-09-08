import { CoffeeOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Result } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import BrandLoader from "../../components/common/loader/BrandLoader";
import OrderChatPanel from "../../components/order/views/OrderChatPanel";
import OrderProgress from "../../components/order/views/OrderProgress";
import OrderReceipt from "../../components/order/views/OrderReceipt";
import { OrderStatusEnum, describeOrderType } from "../../enums/order.enum";
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
  const { order, steps, isLoading, isError, refetch, isRefused, isRejected, isCancelled, isAwaitingApproval } =
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
            {isRejected
              ? "We couldn't accept this order"
              : isCancelled
                ? "This order was cancelled"
                : isAwaitingApproval
                  ? "Checking your payment"
                  : order.status === OrderStatusEnum.Ready
                    ? "Your drink is ready"
                    : "Thanks, we're on it"}
          </h1>
          <p className={pageSubtitle}>
            {isRejected
              ? order.rejection_reason ??
                "Please get in touch with the shop about a refund."
              : isCancelled
                ? order.cancel_reason ??
                  "Please talk to the counter for a refund or a redo."
                : isAwaitingApproval
                  ? "We're confirming your payment now. Nothing is being made yet — we'll start the moment it clears."
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
                <span className={claimMetaValue}>
                  {describeOrderType(order.order_type, order.order_channel)}
                </span>
              </div>
              <div className={claimMetaItem}>
                <span className={claimMetaLabel}>Items</span>
                <span className={claimMetaValue}>{order.item_count}</span>
              </div>
            </div>
          </div>

          {!isRefused && !isAwaitingApproval && (
            <OrderProgress
              steps={steps}
              queuePosition={order.queue_position}
              status={order.status}
            />
          )}

          {/* chat_open is decided server-side by chat_is_open(): an approved
              online order, still inside its retention window. */}
          {order.chat_open ? (
            <OrderChatPanel orderId={order.id} open={order.chat_open} />
          ) : null}

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
