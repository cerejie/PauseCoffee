import { ArrowRightOutlined, CloseOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import { useAccentVars } from "../../../hook/common/accent.hook";
import { statusPalette } from "../../../constants/brand.constants";
import {
  OrderStatusEnum,
  nextOrderStatus,
  orderStatusLabel,
  orderTypeLabel,
} from "../../../enums/order.enum";
import type { IOrderTicket } from "../../../models/data/order/order.response";
import { formatElapsed, formatPeso, minutesSince } from "../../../utils/formatter.utils";
import { describeItem } from "../../../utils/order.utils";
import {
  advanceButton,
  cancelButton,
  ticket as ticketClass,
  ticketCode,
  ticketFooter,
  ticketHead,
  ticketItem,
  ticketItemBody,
  ticketItemMeta,
  ticketItemName,
  ticketItemNote,
  ticketItems,
  ticketName,
  ticketNote,
  ticketQty,
  ticketTimer,
  ticketTimerLate,
  ticketTotal,
  ticketTypeChip,
} from "../../../styles/admin/queue.css";

interface OrderTicketCardProps {
  ticket: IOrderTicket;
  busy: boolean;
  onAdvance: (ticket: IOrderTicket) => void;
  onCancel: (ticket: IOrderTicket) => void;
}

/// Ten minutes is the point where a waiting customer starts looking up.
const LATE_AFTER_MINUTES = 10;

const OrderTicketCard = ({ ticket, busy, onAdvance, onCancel }: OrderTicketCardProps) => {
  const accentVars = useAccentVars(statusPalette[ticket.status]?.fg);
  const next = nextOrderStatus[ticket.status];
  const late = minutesSince(ticket.placed_at) >= LATE_AFTER_MINUTES;

  const advanceLabel =
    next === OrderStatusEnum.Preparing
      ? "Start"
      : next === OrderStatusEnum.Ready
        ? "Ready"
        : "Hand over";

  return (
    <article className={ticketClass} style={accentVars}>
      <header className={ticketHead}>
        <div>
          <div className={ticketCode}>{ticket.order_number}</div>
          <div className={ticketName}>{ticket.customer_name}</div>
          <div className={late ? `${ticketTimer} ${ticketTimerLate}` : ticketTimer}>
            <ClockCircleOutlined />
            {formatElapsed(ticket.placed_at)} · {orderStatusLabel[ticket.status]}
          </div>
        </div>
        <span className={ticketTypeChip}>{orderTypeLabel[ticket.order_type]}</span>
      </header>

      <div className={ticketItems}>
        {ticket.order_items.map((item) => (
          <div key={item.id} className={ticketItem}>
            <span className={ticketQty}>{item.quantity}×</span>
            <div className={ticketItemBody}>
              <div className={ticketItemName}>{item.product_name}</div>
              <div className={ticketItemMeta}>{describeItem(item)}</div>
              {/* The barista must not miss a note, so it is the one red thing. */}
              {item.notes ? (
                <div className={ticketItemNote}>! {item.notes}</div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {ticket.notes ? <p className={ticketNote}>“{ticket.notes}”</p> : null}

      <footer className={ticketFooter}>
        <span className={ticketTotal}>{formatPeso(ticket.total)}</span>

        <Tooltip title="Cancel this order">
          <button
            type="button"
            className={cancelButton}
            onClick={() => onCancel(ticket)}
            disabled={busy}
            aria-label={`Cancel ${ticket.order_number}`}
          >
            <CloseOutlined />
          </button>
        </Tooltip>

        {next ? (
          <button
            type="button"
            className={advanceButton}
            onClick={() => onAdvance(ticket)}
            disabled={busy}
          >
            {advanceLabel} <ArrowRightOutlined />
          </button>
        ) : null}
      </footer>
    </article>
  );
};

export default OrderTicketCard;
