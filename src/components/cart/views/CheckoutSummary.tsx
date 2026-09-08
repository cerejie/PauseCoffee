import { ArrowRightOutlined } from "@ant-design/icons";
import { Form, Input } from "antd";
import { inStoreOrderTypes, orderTypeLabel } from "../../../enums/order.enum";
import OrderTypePicker from "./OrderTypePicker";
import type { useOrderFormHook } from "../../../hook/data/order/order.form.hook";
import { formatPeso } from "../../../utils/formatter.utils";
import {
  fieldLabel,
  proceedButton,
  proceedHint,
  summary,
  summaryBody,
  summaryFooter,
  summaryHead,
  summaryTitle,
  totalsDivider,
  totalsGrand,
  totalsGrandLabel,
  totalsGrandValue,
  totalsRow,
} from "../../../styles/cart/cart.css";

interface CheckoutSummaryProps {
  checkout: ReturnType<typeof useOrderFormHook>;
}

/// Name, dine-in or take-out, a note, and the button that hands the order to
/// the counter. antd Form owns the field values — never a store.
const CheckoutSummary = ({ checkout }: CheckoutSummaryProps) => {
  const { form, itemCount, subtotal, isPlacing, initialValues, onSubmit } = checkout;

  return (
    <aside className={summary}>
      <div className={summaryHead}>
        <h2 className={summaryTitle}>Your order</h2>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={onSubmit}
        requiredMark={false}
      >
        <div className={summaryBody}>
          <div>
            <label className={fieldLabel} htmlFor="customer_name">
              Name for the cup
            </label>
            <Form.Item
              name="customer_name"
              style={{ marginBottom: 0 }}
              rules={[
                { required: true, message: "We need a name to call out." },
                { max: 60, message: "That name is a little long." },
                {
                  whitespace: true,
                  message: "We need a name to call out.",
                },
              ]}
            >
              <Input id="customer_name" size="large" placeholder="e.g. Ejie" />
            </Form.Item>
          </div>

          <div>
            <span className={fieldLabel}>Where are you having it?</span>
            <Form.Item name="order_type" style={{ marginBottom: 0 }}>
              <OrderTypePicker
                types={inStoreOrderTypes}
                labelFor={(type) => orderTypeLabel[type]}
              />
            </Form.Item>
          </div>

          <div>
            <label className={fieldLabel} htmlFor="order_notes">
              Anything else?
            </label>
            <Form.Item name="notes" style={{ marginBottom: 0 }}>
              <Input.TextArea
                id="order_notes"
                rows={2}
                maxLength={200}
                placeholder="Allergies, pickup time, table number…"
              />
            </Form.Item>
          </div>

          <div className={totalsDivider} />

          <div className={totalsRow}>
            <span>
              {itemCount} {itemCount === 1 ? "drink" : "drinks"}
            </span>
            <span>{formatPeso(subtotal)}</span>
          </div>

          <div className={totalsGrand}>
            <span className={totalsGrandLabel}>Total</span>
            <span className={totalsGrandValue}>{formatPeso(subtotal)}</span>
          </div>
        </div>

        <div className={summaryFooter}>
          <button
            type="submit"
            className={proceedButton}
            disabled={isPlacing || itemCount === 0}
          >
            {isPlacing ? "Sending to the counter…" : "Proceed to order"}
            {!isPlacing && <ArrowRightOutlined />}
          </button>
          <p className={proceedHint}>
            Your order goes straight to the barista queue. Pay at the counter when you
            pick it up.
          </p>
        </div>
      </Form>
    </aside>
  );
};

export default CheckoutSummary;
