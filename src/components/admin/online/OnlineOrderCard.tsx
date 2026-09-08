import { ClockCircleOutlined, FileSearchOutlined } from "@ant-design/icons";
import {
  OrderChannelEnum,
  describeOrderType,
  paymentMethodLabel,
} from "../../../enums/order.enum";
import type { IOrderTicket } from "../../../models/data/order/order.response";
import { formatElapsed, formatPeso, minutesSince } from "../../../utils/formatter.utils";
import { describeItem } from "../../../utils/order.utils";
import {
  card,
  cardHead,
  code,
  customer,
  itemList,
  itemQty,
  itemRow,
  meta,
  metaLate,
  reviewButton,
  totalLabel,
  totalRow,
  totalValue,
  typeChip,
} from "../../../styles/admin/online.css";

/// Somebody who has just transferred money starts wondering whether it went
/// through at about this point.
const WAITING_TOO_LONG_MINUTES = 10;

interface OnlineOrderCardProps {
  order: IOrderTicket;
  onReview: (order: IOrderTicket) => void;
}

/// One order awaiting a decision. A summary only — the receipt is deliberately
/// not decidable from here, because approving a payment you have not looked at
/// is the one mistake this whole screen exists to prevent.
const OnlineOrderCard = ({ order, onReview }: OnlineOrderCardProps) => {
  const waiting = minutesSince(order.placed_at);
  const late = waiting >= WAITING_TOO_LONG_MINUTES;

  return (
    <article className={card}>
      <header className={cardHead}>
        <div>
          <div className={code}>{order.order_number}</div>
          <div className={customer}>{order.customer_name}</div>
          <div className={late ? `${meta} ${metaLate}` : meta}>
            <ClockCircleOutlined />
            waiting {formatElapsed(order.placed_at)}
          </div>
        </div>
        <span className={typeChip}>
          {describeOrderType(order.order_type, OrderChannelEnum.Online)}
        </span>
      </header>

      <div className={itemList}>
        {order.order_items.slice(0, 3).map((item) => (
          <div key={item.id} className={itemRow}>
            <span className={itemQty}>{item.quantity}×</span>
            <span>
              {item.product_name}
              <span style={{ opacity: 0.7 }}> · {describeItem(item)}</span>
            </span>
          </div>
        ))}
        {order.order_items.length > 3 ? (
          <div className={itemRow} style={{ opacity: 0.7 }}>
            + {order.order_items.length - 3} more
          </div>
        ) : null}
      </div>

      <div className={totalRow}>
        <div>
          <div className={totalLabel}>
            {order.payment_method ? paymentMethodLabel[order.payment_method] : "Paid"}
          </div>
          <div className={totalValue}>{formatPeso(order.total)}</div>
        </div>
      </div>

      <button type="button" className={reviewButton} onClick={() => onReview(order)}>
        <FileSearchOutlined /> Review &amp; decide
      </button>
    </article>
  );
};

export default OnlineOrderCard;
