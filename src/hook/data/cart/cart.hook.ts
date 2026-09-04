import { useMemo } from "react";
import { cartLineTotal, type ICartLine } from "../../../models/data/order/cart.model";
import { useCartStore } from "../../../store/data/cart/cart.store";

/// The cart's read side. Every screen that shows a count, a subtotal or the
/// lines themselves goes through here, so the arithmetic exists once.
export const useCartHook = () => {
  const lines = useCartStore((s) => s.lines);
  const addLine = useCartStore((s) => s.addLine);
  const replaceLine = useCartStore((s) => s.replaceLine);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeLine = useCartStore((s) => s.removeLine);
  const clearCart = useCartStore((s) => s.clearCart);

  const itemCount = useMemo(
    () => lines.reduce((total, line) => total + line.quantity, 0),
    [lines],
  );

  const subtotal = useMemo(
    () => lines.reduce((total, line) => total + cartLineTotal(line), 0),
    [lines],
  );

  return {
    lines,
    itemCount,
    subtotal,
    addLine,
    replaceLine,
    setQuantity,
    removeLine,
    clearCart,
    lineTotal: (line: ICartLine) => cartLineTotal(line),
  };
};
