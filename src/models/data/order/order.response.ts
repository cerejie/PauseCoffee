import type {
  OrderChannelEnum,
  OrderStatusEnum,
  OrderTypeEnum,
  PaymentMethodEnum,
  TemperatureEnum,
} from "../../../enums/order.enum";

export interface IOrderItemAddon {
  id: string;
  name: string;
  price: number;
}

export interface IOrderItem {
  id: string;
  product_name: string;
  size_label: string;
  temperature: TemperatureEnum | null;
  sweetness: string | null;
  unit_price: number;
  addons: IOrderItemAddon[];
  addons_total: number;
  quantity: number;
  line_total: number;
  notes: string | null;
}

/// A whole row of public.orders — what staff select, and what place_order and
/// review_online_order hand back. Every online column is nullable because an
/// in-store order fills none of them.
export interface IOrder {
  id: string;
  order_number: string;
  customer_name: string;
  order_type: OrderTypeEnum;
  order_channel: OrderChannelEnum;
  status: OrderStatusEnum;
  notes: string | null;
  subtotal: number;
  total: number;
  item_count: number;
  placed_at: string;
  /// When the ticket joined the barista's queue — `placed_at` in store, the
  /// moment of approval online. The board sorts by this, so an order approved
  /// two hours after it was submitted does not jump ahead of the walk-ins.
  queued_at: string;
  accepted_at: string | null;
  ready_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;

  payment_method: PaymentMethodEnum | null;
  payment_reference: string | null;
  /// Object path in the private bucket. Staff-only: the guest RPC never returns
  /// it, and it is nulled once migration 0017 has purged the image.
  payment_proof_path: string | null;
  contact_phone: string | null;
  delivery_address: string | null;
  delivery_landmark: string | null;
  delivery_lat: number | null;
  delivery_lng: number | null;

  approved_at: string | null;
  approved_by: string | null;
  rejected_at: string | null;
  rejected_by: string | null;
  rejection_reason: string | null;
}

/// What get_order() returns: the order, its lines, how many tickets are ahead
/// of it, and whether its chat is open. Narrower than IOrder on purpose — the
/// receipt path and the ids of the staff who reviewed it are not the
/// customer's business, so the RPC does not select them and neither does this.
export interface IOrderDetail
  extends Omit<
    IOrder,
    "payment_proof_path" | "approved_by" | "rejected_by" | "queued_at"
  > {
  items: IOrderItem[];
  queue_position: number;
  /// Computed server-side by chat_is_open(), so the composer can never be shown
  /// for a thread the RPC would then refuse to accept a message into.
  chat_open: boolean;
}

/// A queue ticket — the order plus its lines, read straight from the tables.
export interface IOrderTicket extends IOrder {
  order_items: IOrderItem[];
}
