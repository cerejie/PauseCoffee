import dayjs from "dayjs";
import { useEffect, useRef } from "react";
import { MessageSenderEnum } from "../../../enums/order.enum";
import type { IOrderMessage } from "../../../models/data/order/message.response";
import { prefersReducedMotion } from "../../../utils/motion.utils";
import { bubble } from "../../../styles/common/motion.css";
import {
  author,
  daySplit,
  orderSplit,
  empty,
  message as messageClass,
  messageMine,
  messageTheirs,
  row,
  rowMine,
  rowTheirs,
  stamp,
  thread,
  typing,
  typingDot,
} from "../../../styles/common/chat.css";

interface ChatThreadProps {
  messages: IOrderMessage[];
  /// Which side of the conversation is reading. Their own words go right.
  viewer: MessageSenderEnum;
  /// What to call the other party. The customer never sees a staff name — to
  /// them every reply is from the shop — so this is where that is decided.
  themLabel: string;
  emptyLabel: string;
  /// Message id → the rule to draw above it. Both sides of the conversation
  /// span several orders now, and a run of messages needs to say which one it
  /// belonged to. Which message starts a run is the caller's to work out —
  /// only it knows what the messages are grouped by.
  sections?: ReadonlyMap<string, string>;
  /// A message is in flight; the dots stand in for it until the server agrees.
  sending?: boolean;
  height?: number | string;
}

const dayLabel = (value: string): string => {
  const at = dayjs(value);
  if (at.isSame(dayjs(), "day")) return "Today";
  if (at.isSame(dayjs().subtract(1, "day"), "day")) return "Yesterday";
  return at.format("D MMM");
};

/// The conversation. Shared by the customer's tracker and the staff drawer —
/// only the side a bubble sits on and the name above it differ, which is why
/// this is one component rather than two that drift apart.
const ChatThread = ({
  messages,
  viewer,
  themLabel,
  emptyLabel,
  sections,
  sending,
  height = 320,
}: ChatThreadProps) => {
  const endRef = useRef<HTMLDivElement | null>(null);
  const count = useRef(0);

  useEffect(() => {
    const isFirstPaint = count.current === 0;
    count.current = messages.length;

    endRef.current?.scrollIntoView({
      // The first render jumps to the bottom; everything after it glides, so a
      // reply arriving does not yank the thread out from under a reader.
      behavior: isFirstPaint || prefersReducedMotion() ? "auto" : "smooth",
      block: "end",
    });
  }, [messages.length, sending]);

  return (
    <div className={thread} style={{ height }}>
      {messages.length === 0 && !sending ? (
        <p className={empty}>{emptyLabel}</p>
      ) : null}

      {messages.map((entry, index) => {
        const mine = entry.sender === viewer;
        const previous = messages[index - 1];
        const newDay =
          !previous || !dayjs(previous.created_at).isSame(entry.created_at, "day");
        // One name per run of messages: a back-and-forth should not repeat
        // "PAUSE COFFEE" above every line.
        const newSpeaker = !previous || previous.sender !== entry.sender;
        const section = sections?.get(entry.id);

        return (
          <div key={entry.id} style={{ display: "contents" }}>
            {newDay ? (
              <span className={daySplit}>{dayLabel(entry.created_at)}</span>
            ) : null}

            {section ? <span className={orderSplit}>{section}</span> : null}

            <div
              className={`${row} ${mine ? rowMine : rowTheirs} ${bubble}`}
              style={{ animationDelay: `${Math.min(index, 6) * 30}ms` }}
            >
              {!mine && newSpeaker ? <span className={author}>{themLabel}</span> : null}
              <div
                className={`${messageClass} ${mine ? messageMine : messageTheirs}`}
              >
                {entry.body}
              </div>
              <span className={stamp}>{dayjs(entry.created_at).format("h:mm A")}</span>
            </div>
          </div>
        );
      })}

      {sending ? (
        <div className={typing} aria-label="Sending">
          <span className={typingDot} />
          <span className={typingDot} style={{ animationDelay: "160ms" }} />
          <span className={typingDot} style={{ animationDelay: "320ms" }} />
        </div>
      ) : null}

      <div ref={endRef} />
    </div>
  );
};

export default ChatThread;
