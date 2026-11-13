import { useCallback, useMemo } from "react";
import { cartLineTotal, type ICartLine } from "../../../models/data/order/cart.model";
import { useCartStore } from "../../../store/data/cart/cart.store";
import { discountedPrice } from "../../../utils/discount.utils";
import { useStorefrontDiscountHook } from "../settings/settings.hook";

/// The cart's read side. Every screen that shows a count, a subtotal or the
/// lines themselves goes through here, so the arithmetic exists once.
///
/// Lines hold LIST prices; the shop-wide discount is applied here, on read,
/// with whatever is live now. Switching the promo on or off therefore reprices
/// a cart already built, which is what place_order is about to do anyway.
export const useCartHook = () => {
  const lines = useCartStore((s) => s.lines);
  const addLine = useCartStore((s) => s.addLine);
  const replaceLine = useCartStore((s) => s.replaceLine);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeLine = useCartStore((s) => s.removeLine);
  const clearCart = useCartStore((s) => s.clearCart);
  const discount = useStorefrontDiscountHook();

  /// The drink is discounted, the add-ons are not (0021).
  const lineTotal = useCallback(
    (line: ICartLine) =>
      (discountedPrice(line.unitPrice, discount) +
        line.addons.reduce((sum, addon) => sum + Number(addon.price), 0)) *
      line.quantity,
    [discount],
  );

  const itemCount = useMemo(
    () => lines.reduce((total, line) => total + line.quantity, 0),
    [lines],
  );

  /// Before the discount — the struck-through figure at checkout.
  const originalSubtotal = useMemo(
    () => lines.reduce((total, line) => total + cartLineTotal(line), 0),
    [lines],
  );

  /// What the customer pays. Named subtotal because every bar and checkout
  /// already reads it as "the amount".
  const subtotal = useMemo(
    () => lines.reduce((total, line) => total + lineTotal(line), 0),
    [lines, lineTotal],
  );

  return {
    lines,
    itemCount,
    originalSubtotal,
    discountTotal: Math.max(originalSubtotal - subtotal, 0),
    subtotal,
    addLine,
    replaceLine,
    setQuantity,
    removeLine,
    clearCart,
    lineTotal,
  };
};
