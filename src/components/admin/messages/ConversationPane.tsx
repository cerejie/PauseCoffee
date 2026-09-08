import { ArrowLeftOutlined, PhoneOutlined } from "@ant-design/icons";
import { MessageSenderEnum } from "../../../enums/order.enum";
import { useCustomerChatHook } from "../../../hook/data/admin/customer.chat.hook";
import type { ICustomerThread } from "../../../models/data/order/message.response";
import { initialsOf } from "../../../utils/formatter.utils";
import ChatComposer from "../../common/chat/ChatComposer";
import ChatThread from "../../common/chat/ChatThread";
import {
  avatar,
  paneBack,
  paneHead,
  paneIdentity,
  paneLink,
  paneName,
  paneSub,
  replyNote,
} from "../../../styles/admin/messages.css";

interface ConversationPaneProps {
  thread: ICustomerThread;
  onBack: () => void;
}

/// One customer's whole conversation. Their number is a tap away because half
/// of what gets typed here is better said out loud — "nobody is answering the
/// gate" wants a call, not a reply.
const ConversationPane = ({ thread, onBack }: ConversationPaneProps) => {
  const { messages, sections, isSending, canSend, replyOrderNumber, send } =
    useCustomerChatHook(thread);

  return (
    <>
      <header className={paneHead}>
        <button
          type="button"
          className={paneBack}
          onClick={onBack}
          aria-label="Back to conversations"
        >
          <ArrowLeftOutlined />
        </button>

        <span className={avatar} aria-hidden="true">
          {initialsOf(thread.customer_name)}
        </span>

        <div className={paneIdentity}>
          <h2 className={paneName}>{thread.customer_name}</h2>
          <p className={paneSub}>
            <span>
              {thread.order_count} order{thread.order_count === 1 ? "" : "s"}
            </span>
            {thread.contact_phone ? (
              <a className={paneLink} href={`tel:${thread.contact_phone}`}>
                <PhoneOutlined /> {thread.contact_phone}
              </a>
            ) : null}
          </p>
        </div>
      </header>

      <ChatThread
        messages={messages}
        viewer={MessageSenderEnum.Staff}
        themLabel={thread.customer_name}
        emptyLabel="No messages yet."
        sections={sections}
        sending={isSending}
        height="100%"
      />

      {/* The shop answers a person; the database still files the reply against
          a ticket. Said once, here, rather than left to be inferred. */}
      {canSend && replyOrderNumber && thread.order_count > 1 ? (
        <p className={replyNote}>Replying on order {replyOrderNumber}</p>
      ) : null}

      <ChatComposer
        onSend={send}
        sending={isSending}
        closed={!canSend}
        closedLabel={
          thread.chat_open
            ? "Sign in again to reply."
            : "Every order in this conversation has closed."
        }
        placeholder="Reply as Pause Coffee…"
      />
    </>
  );
};

export default ConversationPane;
