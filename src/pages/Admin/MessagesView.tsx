import { MessageOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useState } from "react";
import ConversationList from "../../components/admin/messages/ConversationList";
import ConversationPane from "../../components/admin/messages/ConversationPane";
import BrandLoader from "../../components/common/loader/BrandLoader";
import EmptyState from "../../components/common/state/EmptyState";
import { useMessageInboxHook } from "../../hook/data/admin/message.inbox.hook";
import { rise } from "../../styles/common/motion.css";
import {
  hiddenOnPhone,
  messenger,
  pane,
  paneEmpty,
  sidebar,
} from "../../styles/admin/messages.css";

/// Every conversation with a customer, one row per person. Unanswered ones sit
/// at the top — without this screen a message on an already-completed order has
/// nowhere to appear and would simply be missed.
///
/// Two panes rather than a list and a drawer: a reply is written while still
/// scanning who else is waiting, and a drawer covers exactly that. On a phone
/// there is only room for one of them, so the list steps aside.
const MessagesView = () => {
  const { threads, isLoading, isError, refetch } = useMessageInboxHook();
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Taken from the live list rather than frozen at open, so a reply sent from
  // another device does not leave a stale header in this one — and a thread
  // that has been purged falls back to the empty pane instead of persisting.
  const current = threads.find((thread) => thread.customer_key === activeKey) ?? null;

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
    <div className={`${messenger} ${rise}`}>
      <aside className={`${sidebar} ${current ? hiddenOnPhone : ""}`}>
        <ConversationList
          threads={threads}
          activeKey={current?.customer_key ?? null}
          onSelect={(thread) => setActiveKey(thread.customer_key)}
        />
      </aside>

      <section className={`${pane} ${current ? "" : hiddenOnPhone}`}>
        {current ? (
          <ConversationPane
            // Remounted per customer so the composer's draft and the thread's
            // scroll position belong to the conversation on screen.
            key={current.customer_key}
            thread={current}
            onBack={() => setActiveKey(null)}
          />
        ) : (
          <div className={paneEmpty}>
            <EmptyState
              icon={<MessageOutlined />}
              title="Pick a conversation"
              description="Choose someone on the left to read and reply."
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default MessagesView;
