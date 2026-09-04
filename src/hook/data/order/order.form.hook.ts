import { useMutation } from "@tanstack/react-query";
import { App, Form } from "antd";
import { useNavigate } from "react-router-dom";
import { OrderTypeEnum } from "../../../enums/order.enum";
import type {
  ICheckoutFormRequest,
  IPlaceOrderRequest,
} from "../../../models/data/order/order.request";
import { orderServices } from "../../../services/data/order/order.services";
import { useOrderStore } from "../../../store/data/order/order.store";
import { supabaseError } from "../../../utils/supabase.utils";
import { useCartHook } from "../cart/cart.hook";

/// Checkout. The cart supplies the lines, the form supplies who and how — and
/// the server supplies every peso, so nothing here sends a price.
export const useOrderFormHook = () => {
  const [form] = Form.useForm<ICheckoutFormRequest>();
  const { notification } = App.useApp();
  const navigate = useNavigate();

  const { lines, itemCount, subtotal, clearCart } = useCartHook();
  const setLastOrderId = useOrderStore((s) => s.setLastOrderId);

  const mutation = useMutation({
    mutationFn: (values: ICheckoutFormRequest) => {
      const request: IPlaceOrderRequest = {
        customer_name: values.customer_name.trim(),
        order_type: values.order_type,
        notes: values.notes?.trim() || null,
        items: lines.map((line) => ({
          size_id: line.sizeId,
          quantity: line.quantity,
          temperature: line.temperature,
          sweetness: line.sweetness,
          addon_ids: line.addons.map((addon) => addon.id),
          notes: line.notes,
        })),
      };

      return orderServices.placeOrder(request);
    },

    onSuccess: (order) => {
      // Clear only after the server has the order — a failed call must leave
      // the cart exactly as it was.
      clearCart();
      setLastOrderId(order.id);
      form.resetFields();

      notification.success({
        message: `Order ${order.order_number} sent to the counter`,
        description: "We'll show you when it's being prepared.",
        placement: "bottomRight",
      });

      navigate(`/order/${order.id}`, { replace: true });
    },

    onError: (error) => {
      notification.error({
        message: "We couldn't place that order",
        description: supabaseError(error),
        placement: "bottomRight",
      });
    },
  });

  return {
    form,
    lines,
    itemCount,
    subtotal,
    isPlacing: mutation.isPending,
    initialValues: { order_type: OrderTypeEnum.TakeOut } as ICheckoutFormRequest,
    onSubmit: (values: ICheckoutFormRequest) => mutation.mutate(values),
  };
};
