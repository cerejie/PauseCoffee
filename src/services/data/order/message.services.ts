import { MessageSenderEnum } from "../../../enums/order.enum";
import type {
  ICustomerThread,
  IDeviceMessage,
  IOrderMessage,
  IStaffOrderMessage,
} from "../../../models/data/order/message.response";
import { supabase } from "../../../utils/supabase.utils";

/// The chat's two sides reach the same table through different doors: the guest
/// through SECURITY DEFINER RPCs (they have no policy on order_messages, just
/// as they have none on orders), staff through the table itself. Both are
/// gated on chat_is_open() — approved online orders only, and only while the
/// order is still inside its retention window.
///
/// They also see different groupings of the same rows, because they know
/// different things about who is talking. The guest asks by device_id, the one
/// name their browser has for itself; staff ask by customer, which the database
/// groups on contact_phone.
export const messageServices = {
  /// Guest read of everything this browser has said, across every order still
  /// inside its window. This is what survives a refresh: the tracker's URL
  /// names one order, the conversation is not limited to it.
  getDeviceMessages: async (deviceId: string): Promise<IDeviceMessage[]> => {
    const { data, error } = await supabase.rpc("get_device_messages", {
      p_device_id: deviceId,
    });

    if (error) throw error;
    return (data as unknown as IDeviceMessage[] | null) ?? [];
  },

  /// Binds the order a tracker is showing to this browser, if nothing else
  /// has claimed it. What lets a conversation be found again after a refresh
  /// on a phone whose storage was cleared — and what carries orders placed
  /// before the app knew about devices into their own thread.
  claimOrder: async (orderId: string, deviceId: string): Promise<void> => {
    const { error } = await supabase.rpc("claim_order_device", {
      p_order_id: orderId,
      p_device_id: deviceId,
    });

    if (error) throw error;
  },

  /// Guest write from the device rather than from a screen. The server picks
  /// the newest open order — the same one the staff inbox replies to — so
  /// neither side has to say which ticket a line belongs to.
  sendDeviceMessage: async (
    deviceId: string,
    body: string,
  ): Promise<IOrderMessage> => {
    const { data, error } = await supabase.rpc("send_device_message", {
      p_device_id: deviceId,
      p_body: body,
    });

    if (error) throw error;
    return data as unknown as IOrderMessage;
  },

  /// Staff read of one customer's whole conversation, straight from the table —
  /// this side does see who wrote each reply and whether it has been read. The
  /// ids come from the thread row, which lists only orders that carry messages.
  getStaffMessages: async (orderIds: string[]): Promise<IStaffOrderMessage[]> => {
    if (orderIds.length === 0) return [];

    const { data, error } = await supabase
      .from("order_messages")
      .select("*")
      .in("order_id", orderIds)
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

  /// Clears the inbox badge for a whole conversation. Scoped to the customer's
  /// own messages: a staff reply was never unread in the first place.
  markThreadRead: async (orderIds: string[]): Promise<void> => {
    if (orderIds.length === 0) return;

    const { error } = await supabase
      .from("order_messages")
      .update({ read_by_staff: true })
      .in("order_id", orderIds)
      .eq("sender", MessageSenderEnum.Customer)
      .eq("read_by_staff", false);

    if (error) throw error;
  },

  /// The inbox list. One row per customer, aggregated by the
  /// customer_message_threads view so this is one round trip however many
  /// conversations are open.
  getThreads: async (): Promise<ICustomerThread[]> => {
    const { data, error } = await supabase
      .from("customer_message_threads")
      .select("*")
      .order("last_message_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as ICustomerThread[];
  },
};
