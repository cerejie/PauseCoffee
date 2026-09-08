import { MessageOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useState } from "react";
import OrderChatDrawer from "../../components/admin/messages/OrderChatDrawer";
import BrandLoader from "../../components/common/loader/BrandLoader";
import EmptyState from "../../components/common/state/EmptyState";
import { MessageSenderEnum } from "../../enums/order.enum";
import { useMessageInboxHook } from "../../hook/data/admin/message.inbox.hook";
import type { IMessageThread } from "../../models/data/order/message.response";
import { rise } from "../../styles/common/motion.css";
import { staggerDelay } from "../../utils/motion.utils";
import { formatElapsed } from "../../utils/formatter.utils";
import {
  list,
  threadBody,
  threadCode,
  threadHead,
  threadName,
  threadPreview,
  threadPreviewUnread,
  threadRow,
  threadRowUnread,
  threadTime,
  unreadCount,
} from "../../styles/admin/messages.css";

/// Every conversation with a customer. Unanswered ones sit at the top — without
/// this screen a message on an already-completed order has nowhere to appear
/// and would simply be missed.
const MessagesView = () => {
  const { threads, isLoading, isError, refetch } = useMessageInboxHook();
  const [active, setActive] = useState<IMessageThread | null>(null);

  // Taken from the live list rather than frozen at open, so a reply sent from
  // another device does not leave a stale header in this one.
  const current = active
    ? threads.find((thread) => thread.order_id === active.order_id) ?? active
    : null;

  if (isLoading) return <BrandLoader label="Loading conversations" />;

  if (isError) {
    return (
      <EmptyState
        icon={<ReloadOutlined />}
        title="We couldn't load messages"
        description="Check the connection and try again."
        action={
          <Button icon={<ReloadOutlined />} onClick={() => void refetch()}>
            Try again
          </Button>
        }
      />
    );
  }

  if (threads.length === 0) {
    return (
      <EmptyState
        icon={<MessageOutlined />}
        title="No conversations yet"
        description="Customers can message you once you've approved their online order."
      />
    );
  }

  return (
    <>
      <div className={list}>
        {threads.map((thread, index) => {
          const unread = Number(thread.unread_count ?? 0);
          const fromCustomer =
            thread.last_message_sender === MessageSenderEnum.Customer;

          return (
            <button
              key={thread.order_id}
              type="button"
              className={`${threadRow} ${unread ? threadRowUnread : ""} ${rise}`}
              style={staggerDelay(index)}
              onClick={() => setActive(thread)}
            >
              <div className={threadBody}>
                <div className={threadHead}>
                  <span className={threadCode}>{thread.order_number}</span>
                  <span className={threadName}>{thread.customer_name}</span>
                  <span className={threadTime}>
                    {formatElapsed(thread.last_message_at)}
                  </span>
                </div>
                <p
                  className={`${threadPreview} ${unread ? threadPreviewUnread : ""}`}
                >
                  {fromCustomer ? "" : "You: "}
                  {thread.last_message_body ?? ""}
                </p>
              </div>

              {unread > 0 ? <span className={unreadCount}>{unread}</span> : null}
            </button>
          );
        })}
      </div>

      <OrderChatDrawer
        thread={current}
        open={Boolean(active)}
        onClose={() => setActive(null)}
      />
    </>
  );
};

export default MessagesView;
