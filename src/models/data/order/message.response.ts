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

/// The same row as staff read it, straight from the table. Carries who wrote it
/// and whether the shop has seen it — neither of which reaches the customer.
export interface IStaffOrderMessage extends IOrderMessage {
  order_id: string;
  staff_id: string | null;
  read_by_staff: boolean;
}

/// One row of public.order_message_threads — the inbox's list, aggregated in
/// the database so /admin/messages is a single query rather than a fetch per
/// order.
export interface IMessageThread {
  order_id: string;
  order_number: string;
  customer_name: string;
  contact_phone: string | null;
  status: OrderStatusEnum;
  order_type: OrderTypeEnum;
  chat_open: boolean;
  message_count: number;
  unread_count: number;
  last_message_at: string;
  last_message_body: string | null;
  last_message_sender: MessageSenderEnum | null;
}
