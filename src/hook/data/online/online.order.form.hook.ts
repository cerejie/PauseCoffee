import { useMutation } from "@tanstack/react-query";
import { App, Form } from "antd";
import { useNavigate } from "react-router-dom";
import { OrderChannelEnum, OrderTypeEnum } from "../../../enums/order.enum";
import type {
  IOnlineCheckoutFormRequest,
  IPlaceOrderRequest,
} from "../../../models/data/order/order.request";
import { orderServices } from "../../../services/data/order/order.services";
import { useOrderStore } from "../../../store/data/order/order.store";
import { getDeviceId } from "../../../utils/device.utils";
import { supabaseError } from "../../../utils/supabase.utils";
import { useCartHook } from "../cart/cart.hook";
import { useStorefrontSettingsHook } from "../settings/settings.hook";

/// Online checkout. Same contract as the counter — the cart supplies the lines
/// and the server supplies every peso — with one addition: the payload names a
/// receipt the customer has already uploaded, and the server checks that the
/// object really exists before it will cut an order row.
///
/// So the disabled Proceed button is a courtesy, not the control. A payload
/// with no receipt is refused by place_order, and by a check constraint under
/// that.
export const useOnlineOrderFormHook = () => {
  const [form] = Form.useForm<IOnlineCheckoutFormRequest>();
  const { notification } = App.useApp();
  const navigate = useNavigate();

  const { lines, itemCount, subtotal, clearCart } = useCartHook();
  const { storefront } = useStorefrontSettingsHook();
  const setLastOrderId = useOrderStore((s) => s.setLastOrderId);

  const mutation = useMutation({
    mutationFn: (values: IOnlineCheckoutFormRequest) => {
      const isDelivery = values.order_type === OrderTypeEnum.Delivery;

      const request: IPlaceOrderRequest = {
        order_channel: OrderChannelEnum.Online,
        customer_name: values.customer_name.trim(),
        order_type: values.order_type,
        notes: values.notes?.trim() || null,
        // What lets this phone reopen the thread after a refresh, and keep the
        // last order's conversation when the next one starts.
        device_id: getDeviceId(),
        contact_phone: values.contact_phone.trim(),
        payment_method: values.payment_method,
        payment_reference: values.payment_reference?.trim() || null,
        payment_proof_path: values.payment_proof_path,
        // A pickup carries no address at all rather than a stale one left
        // behind by someone who switched away from Delivery mid-form.
        delivery_address: isDelivery ? values.delivery_address?.trim() || null : null,
        delivery_landmark: isDelivery ? values.delivery_landmark?.trim() || null : null,
        delivery_lat: isDelivery ? values.delivery_lat ?? null : null,
        delivery_lng: isDelivery ? values.delivery_lng ?? null : null,
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
      // Only after the server has it — a failed call must leave the cart, and
      // the uploaded receipt, exactly as they were.
      clearCart();
      setLastOrderId(order.id);
      form.resetFields();

      notification.success({
        message: `Order ${order.order_number} sent for confirmation`,
        description: "We'll check your payment and let you know shortly.",
        placement: "bottomRight",
        duration: 6,
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
    storefront,
    isPlacing: mutation.isPending,
    initialValues: {
      // Delivery first: it is why the online app exists, and the customer who
      // wants pickup is one tap from saying so.
      order_type: OrderTypeEnum.Delivery,
      // Preselected when the shop only accepts one wallet, so the commonest
      // setup has one fewer thing to tap.
      payment_method:
        storefront.paymentOptions.length === 1
          ? storefront.paymentOptions[0].method
          : undefined,
    } as IOnlineCheckoutFormRequest,
    onSubmit: (values: IOnlineCheckoutFormRequest) => mutation.mutate(values),
  };
};
