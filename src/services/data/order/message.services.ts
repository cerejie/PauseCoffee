import { MessageSenderEnum } from "../../../enums/order.enum";
import type {
  IMessageThread,
  IOrderMessage,
  IStaffOrderMessage,
} from "../../../models/data/order/message.response";
import type { ISendOrderMessageRequest } from "../../../models/data/order/order.request";
import { supabase } from "../../../utils/supabase.utils";

/// The chat's two sides reach the same table through different doors: the guest
/// through SECURITY DEFINER RPCs (they have no policy on order_messages, just
/// as they have none on orders), staff through the table itself. Both are
/// gated on chat_is_open() — approved online orders only, and only while the
/// order is still inside its retention window.
export const messageServices = {
  /// Guest read. Returns [] rather than an error for a closed or unknown
  /// thread, so the tracker renders an empty panel instead of a failure.
  getMessages: async (orderId: string): Promise<IOrderMessage[]> => {
    const { data, error } = await supabase.rpc("get_order_messages", {
      p_order_id: orderId,
    });

    if (error) throw error;
    return (data as unknown as IOrderMessage[] | null) ?? [];
  },

  /// Guest write. The RPC throttles repeats and caps the thread, so the client
  /// does not have to.
  sendMessage: async ({
    orderId,
    body,
  }: ISendOrderMessageRequest): Promise<IOrderMessage> => {
    const { data, error } = await supabase.rpc("send_order_message", {
      p_order_id: orderId,
      p_body: body,
    });

    if (error) throw error;
    return data as unknown as IOrderMessage;
  },

  /// Staff read of one thread, straight from the table — this side does see
  /// who wrote each reply and whether it has been read.
  getStaffMessages: async (orderId: string): Promise<IStaffOrderMessage[]> => {
    const { data, error } = await supabase
      .from("order_messages")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data ?? []) as unknown as IStaffOrderMessage[];
  },

  /// Staff write. sender and staff_id are set here because the table's insert
  /// policy requires both — a staff session cannot post as the customer.
  sendStaffMessage: async (
    orderId: string,
    staffId: string,
    body: string,
  ): Promise<IStaffOrderMessage> => {
    const { data, error } = await supabase
      .from("order_messages")
      .insert({
        order_id: orderId,
        sender: MessageSenderEnum.Staff,
        staff_id: staffId,
        body,
      })
      .select()
      .single();

    if (error) throw error;
    return data as unknown as IStaffOrderMessage;
  },

  /// Clears the inbox badge for one thread. Scoped to the customer's own
  /// messages: a staff reply was never unread in the first place.
  markThreadRead: async (orderId: string): Promise<void> => {
    const { error } = await supabase
      .from("order_messages")
      .update({ read_by_staff: true })
      .eq("order_id", orderId)
      .eq("sender", MessageSenderEnum.Customer)
      .eq("read_by_staff", false);

    if (error) throw error;
  },

  /// The inbox list. Aggregated by the order_message_threads view so this is
  /// one round trip however many conversations are open.
  getThreads: async (): Promise<IMessageThread[]> => {
    const { data, error } = await supabase
      .from("order_message_threads")
      .select("*")
      .order("last_message_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as IMessageThread[];
  },
};
