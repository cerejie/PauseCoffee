import { MessageSenderEnum } from "../../../enums/order.enum";
import type { ICustomerThread } from "../../../models/data/order/message.response";
import { formatElapsed, initialsOf } from "../../../utils/formatter.utils";
import {
  avatar,
  avatarUnread,
  threadBody,
  threadHead,
  threadName,
  threadPreview,
  threadPreviewUnread,
  threadRow,
  threadRowActive,
  threadTime,
  unreadCount,
} from "../../../styles/admin/messages.css";

interface ConversationListProps {
  threads: ICustomerThread[];
  activeKey: string | null;
  onSelect: (thread: ICustomerThread) => void;
}

/// Who is waiting, most recent first with the unanswered floated to the top.
/// One row is one person — the orders they have open live inside the
/// conversation, where they are context rather than clutter.
const ConversationList = ({ threads, activeKey, onSelect }: ConversationListProps) => (
  <>
    {threads.map((thread) => {
      const unread = Number(thread.unread_count ?? 0);
      const fromCustomer =
        thread.last_message_sender === MessageSenderEnum.Customer;
      const active = thread.customer_key === activeKey;

      return (
        <button
          key={thread.customer_key}
          type="button"
          className={`${threadRow} ${active ? threadRowActive : ""}`}
          onClick={() => onSelect(thread)}
          aria-current={active}
        >
          <span className={`${avatar} ${unread ? avatarUnread : ""}`} aria-hidden="true">
            {initialsOf(thread.customer_name)}
          </span>

          <span className={threadBody}>
            <span className={threadHead}>
              <span className={threadName}>{thread.customer_name}</span>
              <span className={threadTime}>
                {formatElapsed(thread.last_message_at)}
              </span>
            </span>
            <span
              className={`${threadPreview} ${unread ? threadPreviewUnread : ""}`}
            >
              {fromCustomer ? "" : "You: "}
              {thread.last_message_body ?? ""}
            </span>
          </span>

          {unread > 0 ? (
            <span className={unreadCount} aria-label={`${unread} unread`}>
              {unread}
            </span>
          ) : null}
        </button>
      );
    })}
  </>
);

export default ConversationList;
