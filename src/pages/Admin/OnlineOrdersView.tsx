import { CheckCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useState } from "react";
import OnlineOrderCard from "../../components/admin/online/OnlineOrderCard";
import OnlineOrderReviewDrawer from "../../components/admin/online/OnlineOrderReviewDrawer";
import BrandLoader from "../../components/common/loader/BrandLoader";
import EmptyState from "../../components/common/state/EmptyState";
import { useOnlineOrdersHook } from "../../hook/data/admin/online.list.hook";
import type { IOrderTicket } from "../../models/data/order/order.response";
import { board } from "../../styles/admin/online.css";

/// Online orders waiting on a human. Nothing here has reached the barista: the
/// place_order RPC parks an online order in `awaiting_approval`, which is not
/// one of the queue statuses, so it cannot appear on the board until somebody
/// on this screen says so.
const OnlineOrdersView = () => {
  const { orders, isLoading, isError, refetch, isReviewing, approve, reject } =
    useOnlineOrdersHook();

  // A leaf that nothing else can read, so useState rather than a modal store.
  const [reviewing, setReviewing] = useState<IOrderTicket | null>(null);

  // Kept fresh from the list rather than frozen at open, so an order approved
  // in another tab does not leave a stale card open in this one.
  const current = reviewing
    ? orders.find((order) => order.id === reviewing.id) ?? reviewing
    : null;

  if (isLoading) return <BrandLoader label="Checking for online orders" />;

  if (isError) {
    return (
      <EmptyState
        icon={<ReloadOutlined />}
        title="We couldn't load online orders"
        description="Check the connection and try again."
        action={
          <Button icon={<ReloadOutlined />} onClick={() => void refetch()}>
            Try again
          </Button>
        }
      />
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<CheckCircleOutlined />}
        title="Nothing waiting"
        description="Online orders land here the moment a customer pays. You'll hear a chime."
      />
    );
  }

  return (
    <>
      <div className={board}>
        {orders.map((order) => (
          <OnlineOrderCard key={order.id} order={order} onReview={setReviewing} />
        ))}
      </div>

      <OnlineOrderReviewDrawer
        order={current}
        open={Boolean(reviewing)}
        busy={isReviewing}
        onClose={() => setReviewing(null)}
        onApprove={approve}
        onReject={reject}
      />
    </>
  );
};

export default OnlineOrdersView;
