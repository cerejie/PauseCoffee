import { DiscountTypeEnum } from "../enums/discount.enum";
import type { IDiscount } from "../models/data/settings/settings.response";
import { formatPeso } from "./formatter.utils";

/// Rounds to the centavo. The tiny nudge keeps 150 × 0.85 from landing on
/// 127.4999… and rounding the wrong way.
const toCentavo = (value: number): number => Math.round(value * 100 + 1e-6) / 100;

/// A drink's price after the shop-wide discount. Mirrors
/// public.discounted_price (0021), rounding included: the server charges with
/// that one, so a disagreement here is a display bug the customer would see.
export const discountedPrice = (price: number, discount: IDiscount | null): number => {
  if (!discount || discount.value <= 0) return price;

  if (discount.type === DiscountTypeEnum.Percent) {
    const percent = Math.min(discount.value, 100);
    return Math.max(toCentavo((price * (100 - percent)) / 100), 0);
  }

  return Math.max(toCentavo(price - discount.value), 0);
};

/// "10% off" or "₱20 off" — the words beside a struck-through price, so the
/// discount is read rather than inferred from a colour.
export const discountLabel = (discount: IDiscount): string =>
  discount.type === DiscountTypeEnum.Percent
    ? `${discount.value}% off`
    : `${formatPeso(discount.value)} off`;
