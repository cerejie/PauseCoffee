import { SendOutlined } from "@ant-design/icons";
import { Input } from "antd";
import { useState, type KeyboardEvent } from "react";
import { closedNote, composer, sendButton } from "../../../styles/common/chat.css";

interface ChatComposerProps {
  onSend: (body: string) => Promise<unknown>;
  sending?: boolean;
  /// The thread is closed — the server would refuse the message, so the box
  /// goes away rather than letting somebody type into nothing.
  closed?: boolean;
  closedLabel?: string;
  placeholder?: string;
}

const MAX_LENGTH = 1000;

/// The box and the button. Enter sends, Shift+Enter breaks a line — the
/// convention every messaging app already taught everyone.
const ChatComposer = ({
  onSend,
  sending,
  closed,
  closedLabel = "This conversation is closed.",
  placeholder = "Write a message…",
}: ChatComposerProps) => {
  const [draft, setDraft] = useState("");

  const body = draft.trim();
  const canSend = Boolean(body) && !sending;

  const send = async () => {
    if (!canSend) return;

    // Cleared first so the box is ready for the next line immediately; the
    // draft is put back if the server refuses it, because retyping a message
    // you already wrote is the worst way to find out it failed.
    setDraft("");
    try {
      await onSend(body);
    } catch {
      setDraft(body);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    void send();
  };

  if (closed) return <p className={closedNote}>{closedLabel}</p>;

  return (
    <div className={composer}>
      <Input.TextArea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        maxLength={MAX_LENGTH}
        autoSize={{ minRows: 1, maxRows: 4 }}
        aria-label="Message"
      />
      <button
        type="button"
        className={sendButton}
        onClick={() => void send()}
        disabled={!canSend}
        aria-label="Send message"
      >
        <SendOutlined />
      </button>
    </div>
  );
};

export default ChatComposer;
