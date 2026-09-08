import type {
  MessageSenderEnum,
  OrderStatusEnum,
  OrderTypeEnum,
} from "../../../enums/order.enum";

/// What get_order_messages() returns to the customer. Deliberately has no
/// staff_id: to the customer every reply comes from "Pause Coffee", and the
/// RPC does not select the column that would say otherwise.
export interface IOrderMessage {
  id: string;
  sender: MessageSenderEnum;
  body: string;
  created_at: string;
}

/// The same row from get_device_messages(), which spans every order this
/// browser has placed and still carries no staff_id. The order is named so the
/// thread can rule one off from the next.
export interface IDeviceMessage extends IOrderMessage {
  order_id: string;
  order_number: string;
}

/// The same row as staff read it, straight from the table. Carries who wrote it
/// and whether the shop has seen it — neither of which reaches the customer.
export interface IStaffOrderMessage extends IOrderMessage {
  order_id: string;
  staff_id: string | null;
  read_by_staff: boolean;
}

/// One of a customer's orders, as the inbox lists it inside their thread.
export interface IThreadOrder {
  order_id: string;
  order_number: string;
  status: OrderStatusEnum;
  order_type: OrderTypeEnum;
  chat_open: boolean;
  placed_at: string;
  message_count: number;
}

/// One row of public.customer_message_threads — a person, not a ticket.
/// Grouped in the database by contact_phone, so a customer who ordered twice
/// is one conversation with two orders in it rather than two inbox rows that
/// each hold half the context.
export interface ICustomerThread {
  /// The phone number, and what identifies the thread everywhere in the client.
  customer_key: string;
  contact_phone: string | null;
  customer_name: string;
  order_count: number;
  message_count: number;
  unread_count: number;
  last_message_at: string;
  last_message_body: string | null;
  last_message_sender: MessageSenderEnum | null;
  /// True while any of their orders is still inside its window.
  chat_open: boolean;
  /// Where a reply lands: the newest order still open. Null once they have all
  /// closed, which is what takes the composer away.
  reply_order_id: string | null;
  reply_order_number: string | null;
  /// Every order carrying messages — what the thread is read and marked read by.
  order_ids: string[];
  orders: IThreadOrder[];
}
