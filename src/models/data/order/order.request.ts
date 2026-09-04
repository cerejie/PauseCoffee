import type { OrderTypeEnum, TemperatureEnum } from "../../../enums/order.enum";

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
}

/// The checkout form's field shape, kept separate from the RPC payload because
/// the lines come from the cart store, not from the form.
export interface ICheckoutFormRequest {
  customer_name: string;
  order_type: OrderTypeEnum;
  notes?: string;
}
