import { ArrowRightOutlined, PhoneOutlined } from "@ant-design/icons";
import { Form, Input, Skeleton } from "antd";
import { Suspense, lazy } from "react";
import {
  OrderTypeEnum,
  onlineOrderTypeLabel,
  onlineOrderTypes,
  type PaymentMethodEnum,
} from "../../../enums/order.enum";
import type { useOnlineOrderFormHook } from "../../../hook/data/online/online.order.form.hook";
import type { IPaymentOption } from "../../../models/data/settings/settings.response";
import PaymentProofField from "../form/PaymentProofField";
import PaymentQrPanel from "./PaymentQrPanel";
import OrderTypePicker from "../../cart/views/OrderTypePicker";
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
import {
  contactCard,
  contactLink,
  fieldPair,
  methodRow,
  methodTile,
  methodTileActive,
  methodTileSub,
  section,
  sectionHint,
  sectionTitle,
} from "../../../styles/online/online.css";

interface OnlineCheckoutSummaryProps {
  checkout: ReturnType<typeof useOnlineOrderFormHook>;
}

/// Leaflet and react-leaflet are ~170 KB that only a delivery order needs. The
/// counter app never loads them at all, and an online pickup does not either —
/// the chunk is fetched the moment someone taps Delivery.
const DeliveryLocationField = lazy(() => import("../form/DeliveryLocationField"));

/// Philippine mobile, in any of the three spellings people actually type. The
/// server normalises whichever arrives to +639XXXXXXXXX.
const phonePattern = /^(?:\+?63|0)9\d{9}$/;

/// The online checkout. It asks for four things the counter never has to —
/// a number, a place, a payment method and proof of payment — so each is its
/// own titled block rather than one long column of inputs.
const OnlineCheckoutSummary = ({ checkout }: OnlineCheckoutSummaryProps) => {
  const { form, itemCount, subtotal, storefront, isPlacing, initialValues, onSubmit } =
    checkout;

  const orderType = Form.useWatch("order_type", form);
  const method = Form.useWatch("payment_method", form);
  const proofPath = Form.useWatch("payment_proof_path", form);

  const isDelivery = orderType === OrderTypeEnum.Delivery;
  const selectedOption =
    storefront.paymentOptions.find((option) => option.method === method) ?? null;

  const isShut = !storefront.isOnlineOrderingOpen;
  const canSubmit = Boolean(proofPath) && itemCount > 0 && !isShut;

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
        scrollToFirstError
      >
        <div className={summaryBody}>
          <section className={section}>
            <h3 className={sectionTitle}>Who's this for?</h3>
            <p className={sectionHint}>
              We'll use your number if there's a problem with the order.
            </p>

            <div className={fieldPair}>
              <div>
                <label className={fieldLabel} htmlFor="customer_name">
                  Name
                </label>
                <Form.Item
                  name="customer_name"
                  style={{ marginBottom: 12 }}
                  rules={[
                    { required: true, message: "We need a name for the order." },
                    { max: 60, message: "That name is a little long." },
                    { whitespace: true, message: "We need a name for the order." },
                  ]}
                >
                  <Input id="customer_name" size="large" placeholder="e.g. Ejie" />
                </Form.Item>
              </div>

              <div>
                <label className={fieldLabel} htmlFor="contact_phone">
                  Mobile number
                </label>
                <Form.Item
                  name="contact_phone"
                  style={{ marginBottom: 12 }}
                  rules={[
                    { required: true, message: "We need a number to reach you on." },
                    {
                      pattern: phonePattern,
                      message: "That doesn't look right. Use 09XX XXX XXXX.",
                    },
                  ]}
                >
                  <Input
                    id="contact_phone"
                    size="large"
                    inputMode="tel"
                    placeholder="0917 123 4567"
                  />
                </Form.Item>
              </div>
            </div>
          </section>

          <section className={section}>
            <h3 className={sectionTitle}>How do you want it?</h3>
            <p className={sectionHint}>
              {isDelivery
                ? "We'll bring it to the pin you drop below."
                : "Collect it at the counter — we'll tell you when it's ready."}
            </p>

            <Form.Item name="order_type" style={{ marginBottom: isDelivery ? 16 : 0 }}>
              <OrderTypePicker
                types={onlineOrderTypes}
                labelFor={(type) => onlineOrderTypeLabel[type]}
              />
            </Form.Item>

            {isDelivery ? (
              <Suspense fallback={<Skeleton active paragraph={{ rows: 4 }} />}>
                <DeliveryLocationField form={form} />
              </Suspense>
            ) : null}
          </section>

          <section className={section}>
            <h3 className={sectionTitle}>How are you paying?</h3>
            <p className={sectionHint}>
              Pay first, then upload the receipt. We check every payment before
              the order reaches the barista.
            </p>

            {storefront.paymentOptions.length === 0 ? (
              <p className={sectionHint}>
                The shop hasn't set up online payments yet. Please give them a
                call instead.
              </p>
            ) : (
              <>
                <Form.Item
                  name="payment_method"
                  style={{ marginBottom: 0 }}
                  rules={[{ required: true, message: "Pick how you're paying." }]}
                >
                  <PaymentMethodPicker options={storefront.paymentOptions} />
                </Form.Item>

                {selectedOption ? (
                  <PaymentQrPanel
                    option={selectedOption}
                    qrUrl={storefront.qrUrl}
                    amount={subtotal}
                  />
                ) : null}

                <div style={{ marginBottom: 14 }}>
                  <label className={fieldLabel} htmlFor="payment_reference">
                    Reference number{" "}
                    <span style={{ fontWeight: 500 }}>(optional)</span>
                  </label>
                  <Form.Item name="payment_reference" style={{ marginBottom: 0 }}>
                    <Input
                      id="payment_reference"
                      maxLength={60}
                      placeholder="From your payment confirmation"
                    />
                  </Form.Item>
                </div>

                <Form.Item
                  name="payment_proof_path"
                  style={{ marginBottom: 0 }}
                  rules={[
                    {
                      required: true,
                      message: "We can't take the order without your receipt.",
                    },
                  ]}
                >
                  <PaymentProofField />
                </Form.Item>
              </>
            )}
          </section>

          <section className={section}>
            <h3 className={sectionTitle}>Anything else?</h3>
            <Form.Item name="notes" style={{ marginBottom: 0 }}>
              <Input.TextArea
                id="order_notes"
                rows={2}
                maxLength={200}
                placeholder="Allergies, delivery instructions, a time to arrive…"
              />
            </Form.Item>
          </section>

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

          {storefront.contactPhone ? (
            <div className={contactCard}>
              <PhoneOutlined />
              <span>
                Questions before you pay?{" "}
                <a href={`tel:${storefront.contactPhone}`} className={contactLink}>
                  {storefront.contactPhone}
                </a>
              </span>
            </div>
          ) : null}
        </div>

        <div className={summaryFooter}>
          <button type="submit" className={proceedButton} disabled={isPlacing || !canSubmit}>
            {isPlacing ? "Sending your order…" : "Place order"}
            {!isPlacing && <ArrowRightOutlined />}
          </button>
          <p className={proceedHint}>
            {isShut
              ? "The shop isn't taking online orders right now."
              : proofPath
                ? "We'll confirm your payment, then start making it. You can message us from the tracker."
                : "Upload your payment receipt to place the order."}
          </p>
        </div>
      </Form>
    </aside>
  );
};

/// The wallets the shop actually accepts, shaped so antd Form can drive it like
/// any input. Built from settings rather than from the enum: a method that is
/// switched off, or has no account details behind it, must not be offered.
const PaymentMethodPicker = ({
  options,
  value,
  onChange,
}: {
  options: IPaymentOption[];
  value?: PaymentMethodEnum;
  onChange?: (value: PaymentMethodEnum) => void;
}) => (
  <div className={methodRow}>
    {options.map((option) => (
      <button
        key={option.method}
        type="button"
        className={
          value === option.method ? `${methodTile} ${methodTileActive}` : methodTile
        }
        onClick={() => onChange?.(option.method)}
        aria-pressed={value === option.method}
      >
        {option.label}
        <span className={methodTileSub}>
          {option.accountName ?? option.bankName ?? "Scan and pay"}
        </span>
      </button>
    ))}
  </div>
);

export default OnlineCheckoutSummary;
