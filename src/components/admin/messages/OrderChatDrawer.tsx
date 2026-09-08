import { PhoneOutlined } from "@ant-design/icons";
import { Drawer } from "antd";
import { MessageSenderEnum, orderStatusLabel } from "../../../enums/order.enum";
import { useBrandVars } from "../../../hook/common/brand.hook";
import { useAdminOrderChatHook } from "../../../hook/data/admin/order.chat.hook";
import type { IMessageThread } from "../../../models/data/order/message.response";
import ChatComposer from "../../common/chat/ChatComposer";
import ChatThread from "../../common/chat/ChatThread";
import { StatusTag } from "../../common/tag/StatusTag";
import {
  drawerLink,
  drawerMeta,
  drawerShell,
} from "../../../styles/admin/messages.css";

interface OrderChatDrawerProps {
  thread: IMessageThread | null;
  open: boolean;
  onClose: () => void;
}

/// One conversation, opened from the inbox. The customer's number is a tap
/// away because half of what gets typed here is better said out loud —
/// "nobody is answering the gate" wants a call, not a reply.
const OrderChatDrawer = ({ thread, open, onClose }: OrderChatDrawerProps) => {
  const brandVars = useBrandVars();
  const { messages, isSending, canSend, send } = useAdminOrderChatHook(
    thread?.order_id,
    open,
  );

  if (!thread) return null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`${thread.order_number} · ${thread.customer_name}`}
      placement="right"
      width={460}
      // A Drawer portals to <body>, outside the root that carries the style
      // contract, so the brand vars are re-assigned here.
      style={brandVars}
      styles={{ body: { padding: 0, display: "flex", flexDirection: "column" } }}
    >
      <div className={drawerShell}>
        <div className={drawerMeta}>
          <StatusTag status={thread.status} dot />
          <span>{orderStatusLabel[thread.status]}</span>
          {thread.contact_phone ? (
            <a className={drawerLink} href={`tel:${thread.contact_phone}`}>
              <PhoneOutlined /> {thread.contact_phone}
            </a>
          ) : null}
        </div>

        <ChatThread
          messages={messages}
          viewer={MessageSenderEnum.Staff}
          themLabel={thread.customer_name}
          emptyLabel="No messages yet."
          sending={isSending}
          height="100%"
        />

        <ChatComposer
          onSend={send}
          sending={isSending}
          closed={!thread.chat_open || !canSend}
          closedLabel={
            thread.chat_open
              ? "Sign in again to reply."
              : "This conversation has closed."
          }
          placeholder="Reply as Pause Coffee…"
        />
      </div>
    </Drawer>
  );
};

export default OrderChatDrawer;
