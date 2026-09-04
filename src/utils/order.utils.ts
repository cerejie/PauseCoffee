import { temperatureLabel } from "../enums/order.enum";
import type { IOrderItem } from "../models/data/order/order.response";

/// Builds the "16oz · Iced · + Oatmilk" line under an item name — the one
/// description of a configured drink, shared by the customer receipt, the
/// queue ticket and the order history table.
export const describeItem = (item: IOrderItem): string =>
  [
    item.size_label,
    item.temperature ? temperatureLabel[item.temperature] : null,
    item.sweetness ? `${item.sweetness} sweet` : null,
    ...item.addons.map((addon) => `+ ${addon.name}`),
  ]
    .filter(Boolean)
    .join(" · ");
