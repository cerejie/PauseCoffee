import type {
  OrderChannelEnum,
  OrderTypeEnum,
  PaymentMethodEnum,
  TemperatureEnum,
} from "../../../enums/order.enum";

/// What the client is allowed to say. Note there is no price anywhere — the
/// place_order RPC reads every peso from the menu tables itself.
export interface IPlaceOrderLine {
  size_id: string;
  quantity: number;
  temperature?: TemperatureEnum | null;
  sweetness?: string | null;
  addon_ids: string[];
  notes?: string | null;
}

export interface IPlaceOrderRequest {
  customer_name: string;
  order_type: OrderTypeEnum;
  notes?: string | null;
  items: IPlaceOrderLine[];
  /// The uuid this browser knows itself by, so the phone that placed the order
  /// can reopen the conversation on it after a refresh. Minted client-side by
  /// getDeviceId(); it identifies a browser, never a person or a device.
  device_id?: string;

  /// Omitted entirely by the in-store app, which defaults to `in_store`
  /// server-side. Everything below is read only when this says `online`.
  order_channel?: OrderChannelEnum;
  payment_method?: PaymentMethodEnum;
  /// The reference number the customer copies off their wallet receipt. Not
  /// proof of anything on its own — it just makes the receipt easier for staff
  /// to match against the transaction on their end.
  payment_reference?: string | null;
  /// The object path returned by the upload, never a URL. The RPC checks the
  /// object is really in the bucket, so a made-up path is refused.
  payment_proof_path?: string;
  contact_phone?: string;
  delivery_address?: string | null;
  delivery_landmark?: string | null;
  delivery_lat?: number | null;
  delivery_lng?: number | null;
}

/// The in-store checkout form's field shape, kept separate from the RPC payload
/// because the lines come from the cart store, not from the form.
export interface ICheckoutFormRequest {
  customer_name: string;
  order_type: OrderTypeEnum;
  notes?: string;
}

/// Where the customer wants a delivery. The pin is authoritative — the address
/// is what the rider reads, and the customer can always correct it by hand.
export interface IDeliveryLocation {
  lat: number;
  lng: number;
  address: string;
}

/// The online checkout form. `payment_proof_path` is filled in by the upload
/// field rather than typed, and is what the Proceed button waits on.
export interface IOnlineCheckoutFormRequest extends ICheckoutFormRequest {
  contact_phone: string;
  payment_method: PaymentMethodEnum;
  payment_reference?: string;
  payment_proof_path?: string;
  delivery_address?: string;
  delivery_landmark?: string;
  /// Written by the map field, not by an input. Kept on the form so antd's
  /// validation can refuse a delivery with no pin.
  delivery_lat?: number;
  delivery_lng?: number;
}

export interface IReviewOnlineOrderRequest {
  orderId: string;
  approve: boolean;
  reason?: string;
}

