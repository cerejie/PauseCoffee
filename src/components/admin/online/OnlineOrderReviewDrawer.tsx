import {
  CheckOutlined,
  CloseOutlined,
  EnvironmentOutlined,
  LoadingOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { Button, Drawer, Input, Radio, Space } from "antd";
import { useEffect, useState } from "react";
import {
  OrderChannelEnum,
  describeOrderType,
  paymentMethodLabel,
  rejectionReasons,
} from "../../../enums/order.enum";
import { useBrandVars } from "../../../hook/common/brand.hook";
import { useProofUrlHook } from "../../../hook/data/admin/online.list.hook";
import type { IOrderTicket } from "../../../models/data/order/order.response";
import { formatDateTime, formatPeso } from "../../../utils/formatter.utils";
import { describeItem } from "../../../utils/order.utils";
import {
  block,
  blockLabel,
  blockValue,
  detailGrid,
  drawerBody,
  drawerFooter,
  itemList,
  itemQty,
  itemRow,
  mapLink,
  receiptFrame,
  receiptImage,
  receiptMissing,
  rejectPanel,
  rejectTitle,
} from "../../../styles/admin/online.css";

interface OnlineOrderReviewDrawerProps {
  order: IOrderTicket | null;
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onApprove: (orderId: string) => Promise<unknown>;
  onReject: (orderId: string, reason: string) => Promise<unknown>;
}

/// Everything needed to decide, in the order it gets decided: what was ordered,
/// what it cost, where it goes, and the receipt that is supposed to cover it.
///
/// Rejecting opens in place rather than in a modal on top of the drawer —
/// stacked overlays on a phone are how somebody loses track of which one they
/// are answering.
const OnlineOrderReviewDrawer = ({
  order,
  open,
  busy,
  onClose,
  onApprove,
  onReject,
}: OnlineOrderReviewDrawerProps) => {
  const brandVars = useBrandVars();
  const { data: proofUrl, isLoading: proofLoading } = useProofUrlHook(
    order?.payment_proof_path,
  );

  const [isRejecting, setIsRejecting] = useState(false);
  const [reason, setReason] = useState<string>(rejectionReasons[0]);
  const [customReason, setCustomReason] = useState("");

  // A drawer reopened on the next order must not still be mid-rejection from
  // the last one.
  useEffect(() => {
    if (!open) return;
    setIsRejecting(false);
    setReason(rejectionReasons[0]);
    setCustomReason("");
  }, [open, order?.id]);

  if (!order) return null;

  const finalReason = customReason.trim() || reason;

  const mapsHref =
    order.delivery_lat !== null && order.delivery_lng !== null
      ? `https://maps.google.com/?q=${order.delivery_lat},${order.delivery_lng}`
      : null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`${order.order_number} · ${order.customer_name}`}
      placement="right"
      width={520}
      // A Drawer portals to <body>, outside the root that carries the style
      // contract, so the brand vars are re-assigned here.
      style={brandVars}
      styles={{ body: { padding: 0 } }}
    >
      <div className={drawerBody}>
        <div className={detailGrid}>
          <div className={block}>
            <span className={blockLabel}>Total paid</span>
            <span className={blockValue}>{formatPeso(order.total)}</span>
          </div>
          <div className={block}>
            <span className={blockLabel}>Method</span>
            <span className={blockValue}>
              {order.payment_method
                ? paymentMethodLabel[order.payment_method]
                : "—"}
            </span>
          </div>
          <div className={block}>
            <span className={blockLabel}>Reference</span>
            <span className={blockValue}>{order.payment_reference ?? "—"}</span>
          </div>
          <div className={block}>
            <span className={blockLabel}>Placed</span>
            <span className={blockValue}>{formatDateTime(order.placed_at)}</span>
          </div>
        </div>

        <div className={block}>
          <span className={blockLabel}>Receipt</span>
          <div className={receiptFrame}>
            {proofLoading ? (
              <span className={receiptMissing}>
                <LoadingOutlined /> Loading the receipt…
              </span>
            ) : proofUrl ? (
              // Opens full size in a tab — a reference number on a phone
              // screenshot is often unreadable at drawer width.
              <a href={proofUrl} target="_blank" rel="noreferrer">
                <img src={proofUrl} alt="Payment receipt" className={receiptImage} />
              </a>
            ) : (
              <span className={receiptMissing}>
                This receipt is no longer available. Don't approve without it —
                ask the customer to send it again.
              </span>
            )}
          </div>
        </div>

        <div className={block}>
          <span className={blockLabel}>
            {describeOrderType(order.order_type, OrderChannelEnum.Online)}
          </span>
          {order.delivery_address ? (
            <span className={blockValue}>{order.delivery_address}</span>
          ) : (
            <span className={blockValue}>Collecting at the counter</span>
          )}
          {order.delivery_landmark ? (
            <span style={{ fontSize: 12.5, opacity: 0.8 }}>
              Landmark: {order.delivery_landmark}
            </span>
          ) : null}
          {mapsHref ? (
            <a className={mapLink} href={mapsHref} target="_blank" rel="noreferrer">
              <EnvironmentOutlined /> Open in Google Maps
            </a>
          ) : null}
        </div>

        {order.contact_phone ? (
          <div className={block}>
            <span className={blockLabel}>Contact</span>
            <a className={mapLink} href={`tel:${order.contact_phone}`}>
              <PhoneOutlined /> {order.contact_phone}
            </a>
          </div>
        ) : null}

        <div className={block}>
          <span className={blockLabel}>
            {order.item_count} item{order.item_count === 1 ? "" : "s"}
          </span>
          <div className={itemList}>
            {order.order_items.map((item) => (
              <div key={item.id} className={itemRow}>
                <span className={itemQty}>{item.quantity}×</span>
                <span>
                  {item.product_name}
                  <span style={{ opacity: 0.7 }}> · {describeItem(item)}</span>
                  {item.notes ? (
                    <span style={{ display: "block", color: "#B0402C" }}>
                      ! {item.notes}
                    </span>
                  ) : null}
                </span>
              </div>
            ))}
          </div>
        </div>

        {order.notes ? (
          <div className={block}>
            <span className={blockLabel}>Customer note</span>
            <span className={blockValue}>“{order.notes}”</span>
          </div>
        ) : null}
      </div>

      {isRejecting ? (
        <div className={rejectPanel}>
          <p className={rejectTitle}>Why are you turning this down?</p>
          <Radio.Group value={reason} onChange={(event) => setReason(event.target.value)}>
            <Space direction="vertical" size={6}>
              {rejectionReasons.map((entry) => (
                <Radio key={entry} value={entry}>
                  {entry}
                </Radio>
              ))}
            </Space>
          </Radio.Group>

          <Input.TextArea
            rows={2}
            maxLength={200}
            value={customReason}
            onChange={(event) => setCustomReason(event.target.value)}
            placeholder="Or write your own — the customer reads this."
          />
        </div>
      ) : null}

      <div className={drawerFooter}>
        {isRejecting ? (
          <>
            <Button size="large" onClick={() => setIsRejecting(false)} disabled={busy}>
              Back
            </Button>
            <Button
              size="large"
              danger
              type="primary"
              loading={busy}
              icon={<CloseOutlined />}
              onClick={() => void onReject(order.id, finalReason).then(onClose)}
            >
              Confirm rejection
            </Button>
          </>
        ) : (
          <>
            <Button
              size="large"
              danger
              onClick={() => setIsRejecting(true)}
              disabled={busy}
              icon={<CloseOutlined />}
            >
              Reject
            </Button>
            <Button
              size="large"
              type="primary"
              loading={busy}
              icon={<CheckOutlined />}
              onClick={() => void onApprove(order.id).then(onClose)}
            >
              Approve
            </Button>
          </>
        )}
      </div>
    </Drawer>
  );
};

export default OnlineOrderReviewDrawer;
