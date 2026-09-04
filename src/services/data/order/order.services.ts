import type { OrderStatusEnum } from "../../../enums/order.enum";
import type { IPlaceOrderRequest } from "../../../models/data/order/order.request";
import type {
  IOrder,
  IOrderDetail,
  IOrderTicket,
} from "../../../models/data/order/order.response";
import { supabase } from "../../../utils/supabase.utils";

export interface IOrderHistoryRequest {
  pageNumber: number;
  pageSize: number;
  search?: string;
  status?: OrderStatusEnum | null;
}

export const orderServices = {
  /// The only write path open to a guest. The RPC prices every line from the
  /// menu tables, so the payload carries ids and quantities and no money.
  placeOrder: async (request: IPlaceOrderRequest): Promise<IOrder> => {
    const { data, error } = await supabase.rpc("place_order", {
      payload: request as unknown as Record<string, unknown>,
    });

    if (error) throw error;
    return data as unknown as IOrder;
  },

  /// Tracker read. Anonymous callers have no select policy on orders — holding
  /// the uuid is the capability, and this RPC is what honours it.
  getOrder: async (orderId: string): Promise<IOrderDetail | null> => {
    const { data, error } = await supabase.rpc("get_order", { p_order_id: orderId });

    if (error) throw error;
    return (data as unknown as IOrderDetail | null) ?? null;
  },

  /// Live queue — everything not yet finished, oldest first so the barista
  /// works top-down.
  getQueue: async (): Promise<IOrderTicket[]> => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .in("status", ["pending", "preparing", "ready"])
      .order("placed_at", { ascending: true });

    if (error) throw error;
    return (data ?? []) as unknown as IOrderTicket[];
  },

  getHistory: async (
    request: IOrderHistoryRequest,
  ): Promise<{ data: IOrderTicket[]; totalCount: number }> => {
    const from = (request.pageNumber - 1) * request.pageSize;
    const to = from + request.pageSize - 1;

    let query = supabase
      .from("orders")
      .select("*, order_items(*)", { count: "exact" })
      .order("placed_at", { ascending: false })
      .range(from, to);

    if (request.status) query = query.eq("status", request.status);

    const term = request.search?.trim();
    if (term) {
      query = query.or(
        `order_number.ilike.%${term}%,customer_name.ilike.%${term}%`,
      );
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return {
      data: (data ?? []) as unknown as IOrderTicket[],
      totalCount: count ?? 0,
    };
  },

  /// Status changes go through the RPC so the accepted/ready/completed
  /// timestamps are stamped server-side and stay trustworthy.
  setStatus: async (
    orderId: string,
    status: OrderStatusEnum,
    reason?: string,
  ): Promise<IOrder> => {
    const { data, error } = await supabase.rpc("set_order_status", {
      p_order_id: orderId,
      p_status: status,
      p_reason: reason ?? null,
    });

    if (error) throw error;
    return data as unknown as IOrder;
  },
};
