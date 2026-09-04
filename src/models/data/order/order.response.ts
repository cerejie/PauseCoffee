import type {
  OrderStatusEnum,
  OrderTypeEnum,
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

export interface IOrder {
  id: string;
  order_number: string;
  customer_name: string;
  order_type: OrderTypeEnum;
  status: OrderStatusEnum;
  notes: string | null;
  subtotal: number;
  total: number;
  item_count: number;
  placed_at: string;
  accepted_at: string | null;
  ready_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
}

/// What get_order() returns: the order, its lines, and how many tickets are
/// ahead of it. Only the tracker needs the last two.
export interface IOrderDetail extends IOrder {
  items: IOrderItem[];
  queue_position: number;
}

/// A queue ticket — the order plus its lines, read straight from the tables.
export interface IOrderTicket extends IOrder {
  order_items: IOrderItem[];
}
