import type { IOrderItem } from "../../../models/data/order/order.response";
import { formatPeso } from "../../../utils/formatter.utils";
import { describeItem } from "../../../utils/order.utils";
import {
  receipt,
  receiptBody,
  receiptHead,
  receiptLine,
  receiptLineBody,
  receiptLineMeta,
  receiptLineName,
  receiptLinePrice,
  receiptQty,
  receiptTitle,
  receiptTotalLabel,
  receiptTotalRow,
  receiptTotalValue,
  receiptTotals,
} from "../../../styles/order/tracker.css";

interface OrderReceiptProps {
  items: IOrderItem[];
  total: number;
  title?: string;
}

const OrderReceipt = ({ items, total, title = "Order details" }: OrderReceiptProps) => (
  <section className={receipt}>
    <div className={receiptHead}>
      <h2 className={receiptTitle}>{title}</h2>
    </div>

    <div className={receiptBody}>
      {items.map((item) => (
        <div key={item.id} className={receiptLine}>
          <span className={receiptQty}>{item.quantity}×</span>
          <div className={receiptLineBody}>
            <div className={receiptLineName}>{item.product_name}</div>
            <div className={receiptLineMeta}>{describeItem(item)}</div>
            {item.notes ? (
              <div className={receiptLineMeta} style={{ fontStyle: "italic" }}>
                “{item.notes}”
              </div>
            ) : null}
          </div>
          <span className={receiptLinePrice}>{formatPeso(item.line_total)}</span>
        </div>
      ))}
    </div>

    <div className={receiptTotals}>
      <div className={receiptTotalRow}>
        <span className={receiptTotalLabel}>Total</span>
        <span className={receiptTotalValue}>{formatPeso(total)}</span>
      </div>
    </div>
  </section>
);

export default OrderReceipt;
