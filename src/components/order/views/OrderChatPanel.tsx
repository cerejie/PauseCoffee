import { MessageOutlined } from "@ant-design/icons";
import { MessageSenderEnum } from "../../../enums/order.enum";
import { useOrderChatHook } from "../../../hook/data/order/order.chat.hook";
import ChatComposer from "../../common/chat/ChatComposer";
import ChatThread from "../../common/chat/ChatThread";
import { rise } from "../../../styles/common/motion.css";
import {
  liveDot,
  panel,
  panelHead,
  panelTitle,
} from "../../../styles/common/chat.css";

interface OrderChatPanelProps {
  /// The order the tracker is showing. Not what the conversation is keyed on —
  /// that is the device — but what gets adopted into it on first open.
  orderId: string;
  /// Computed by the database (chat_is_open), not here. The RPCs enforce the
  /// same predicate, so a composer shown when this is false would only produce
  /// a refusal.
  open: boolean;
}

/// The customer's line to the shop, on their tracker. Only ever rendered for an
/// approved online order — which is the point of the approval gate: somebody
/// who submits a junk order gets no channel to the counter.
///
/// What it shows is the whole conversation this phone has had with the shop,
/// not this ticket's slice of it: a refresh, or a second order, must not read
/// as starting again from nothing.
const OrderChatPanel = ({ orderId, open }: OrderChatPanelProps) => {
  const { messages, sections, isSending, send } = useOrderChatHook(orderId, open);

  if (!open) return null;

  return (
    <section className={`${panel} ${rise}`}>
      <header className={panelHead}>
        <MessageOutlined />
        <h2 className={panelTitle}>Message the shop</h2>
        <span className={liveDot} aria-hidden="true" />
      </header>

      <ChatThread
        messages={messages}
        viewer={MessageSenderEnum.Customer}
        themLabel="Pause Coffee"
        emptyLabel="Anything we should know? Send it here."
        sections={sections}
        sending={isSending}
        height={280}
      />

      <ChatComposer onSend={send} sending={isSending} />
    </section>
  );
};

export default OrderChatPanel;
