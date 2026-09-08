import { OrderStatusEnum } from "../../../enums/order.enum";
import {
  paymentProofBucket,
  paymentProofPrefix,
  paymentProofSignedUrlSeconds,
} from "../../../constants/payment.constants";
import type {
  IPlaceOrderRequest,
  IReviewOnlineOrderRequest,
} from "../../../models/data/order/order.request";
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
  /// menu tables, so the payload carries ids and quantities and no money — and
  /// for an online order it verifies the receipt exists before cutting a row.
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
  /// works top-down. Sorted by queued_at rather than placed_at: an online order
  /// approved two hours after it was submitted joins the board where it was
  /// approved, not ahead of every walk-in that arrived while it waited.
  getQueue: async (): Promise<IOrderTicket[]> => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .in("status", ["pending", "preparing", "ready"])
      .order("queued_at", { ascending: true });

    if (error) throw error;
    return (data ?? []) as unknown as IOrderTicket[];
  },

  /// The approval inbox. Deliberately its own query and its own key: these are
  /// not queue tickets, and nothing here may leak onto the barista's board.
  getOnlineOrders: async (): Promise<IOrderTicket[]> => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("status", OrderStatusEnum.AwaitingApproval)
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

  /// Approve or reject an online order. The RPC refuses anything that is not
  /// still awaiting a decision, so a double-click cannot re-stamp a ticket the
  /// barista has already started.
  reviewOnlineOrder: async ({
    orderId,
    approve,
    reason,
  }: IReviewOnlineOrderRequest): Promise<IOrder> => {
    const { data, error } = await supabase.rpc("review_online_order", {
      p_order_id: orderId,
      p_approve: approve,
      p_reason: reason ?? null,
    });

    if (error) throw error;
    return data as unknown as IOrder;
  },

  /// The guest's receipt upload. Returns the object path, which is the only
  /// thing the checkout payload carries — the RPC then proves the object is
  /// really there before it will accept the order.
  uploadPaymentProof: async (file: Blob): Promise<string> => {
    const path = `${paymentProofPrefix}/${crypto.randomUUID()}.webp`;

    const { error } = await supabase.storage
      .from(paymentProofBucket)
      .upload(path, file, { contentType: "image/webp" });

    if (error) throw error;
    return path;
  },

  /// Staff-only read of a receipt. The bucket is private, so this is the whole
  /// access path — and the URL expires, so a copied link is not a lasting leak.
  signedProofUrl: async (path: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from(paymentProofBucket)
      .createSignedUrl(path, paymentProofSignedUrlSeconds);

    if (error) throw error;
    return data?.signedUrl ?? null;
  },

  /// Frees the image the moment a rejection is confirmed. Best-effort by
  /// design: migration 0017 has already queued the path, so a failure here
  /// costs an hour's delay rather than an orphaned file.
  deletePaymentProof: async (path: string): Promise<void> => {
    await supabase.storage.from(paymentProofBucket).remove([path]);
  },
};
