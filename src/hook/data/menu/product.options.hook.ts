import { App } from "antd";
import { useCallback, useEffect, useMemo } from "react";
import { TemperatureEnum, sweetnessLevels } from "../../../enums/order.enum";
import { productOptionsModalKey } from "../../../keys/modal.keys";
import type { ICartLine } from "../../../models/data/order/cart.model";
import type { IMenuSection, IProduct } from "../../../models/data/menu/menu.response";
import { useOptionsStore } from "../../../store/data/cart/options.store";
import { formatPeso } from "../../../utils/formatter.utils";
import { useCartHook } from "../cart/cart.hook";
import { useModal } from "../../common/modal.hook";

export interface IProductOptionsPayload {
  product: IProduct;
  section: IMenuSection;
  /// Present when the drawer was opened to edit a line already in the cart.
  editing?: ICartLine;
}

/// Everything the options drawer does: seed the draft from the product (or the
/// line being edited), price the running selection, and commit to the cart.
export const useProductOptionsHook = () => {
  const { message } = App.useApp();
  const { modal, openModal, closeModal } = useModal<IProductOptionsPayload>(
    productOptionsModalKey,
  );
  const { addLine, replaceLine } = useCartHook();

  const draft = useOptionsStore((s) => s.draft);
  const seedDraft = useOptionsStore((s) => s.seedDraft);
  const setSize = useOptionsStore((s) => s.setSize);
  const setTemperature = useOptionsStore((s) => s.setTemperature);
  const setSweetness = useOptionsStore((s) => s.setSweetness);
  const toggleAddon = useOptionsStore((s) => s.toggleAddon);
  const setQuantity = useOptionsStore((s) => s.setQuantity);
  const setNotes = useOptionsStore((s) => s.setNotes);

  const payload = modal.data;
  const product = payload?.product;
  const section = payload?.section;
  const editing = payload?.editing;

  const sizes = useMemo(
    () => (product?.product_sizes ?? []).filter((size) => size.is_active),
    [product],
  );

  // Re-seed whenever the drawer opens on a different product or line. Keyed on
  // the ids rather than the objects so a menu refetch does not wipe a selection
  // the customer is halfway through making.
  useEffect(() => {
    if (!modal.visible || !product || !section) return;

    if (editing) {
      seedDraft({
        sizeId: editing.sizeId,
        temperature: editing.temperature,
        sweetness: editing.sweetness,
        addonIds: editing.addons.map((addon) => addon.id),
        quantity: editing.quantity,
        notes: editing.notes ?? "",
      });
      return;
    }

    seedDraft({
      sizeId: sizes[0]?.id ?? null,
      temperature: section.has_temperature ? TemperatureEnum.Iced : null,
      sweetness: section.has_sweetness ? sweetnessLevels[0] : null,
      addonIds: [],
      quantity: 1,
      notes: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal.visible, product?.id, editing?.key, section?.id]);

  const selectedSize = useMemo(
    () => sizes.find((size) => size.id === draft.sizeId) ?? sizes[0],
    [sizes, draft.sizeId],
  );

  const selectedAddons = useMemo(
    () => (section?.addons ?? []).filter((addon) => draft.addonIds.includes(addon.id)),
    [section, draft.addonIds],
  );

  const unitPrice = useMemo(() => {
    const base = Number(selectedSize?.price ?? 0);
    const extras = selectedAddons.reduce((sum, addon) => sum + Number(addon.price), 0);
    return base + extras;
  }, [selectedSize, selectedAddons]);

  const total = unitPrice * draft.quantity;

  const open = useCallback(
    (next: IProductOptionsPayload) => openModal(next),
    [openModal],
  );

  const submit = useCallback(() => {
    if (!product || !section || !selectedSize) return;

    const line = {
      productId: product.id,
      productName: product.name,
      categoryId: section.id,
      categorySlug: section.slug,
      accentColor: section.accent_color,
      imageUrl: product.image_url,
      sizeId: selectedSize.id,
      sizeLabel: selectedSize.label,
      unitPrice: Number(selectedSize.price),
      temperature: section.has_temperature ? draft.temperature : null,
      sweetness: section.has_sweetness ? draft.sweetness : null,
      addons: selectedAddons.map((addon) => ({
        id: addon.id,
        name: addon.name,
        price: Number(addon.price),
      })),
      quantity: draft.quantity,
      notes: draft.notes.trim() || null,
    };

    if (editing) {
      replaceLine(editing.key, line);
      void message.success(`${product.name} updated`);
    } else {
      addLine(line);
      void message.success(`${product.name} added — ${formatPeso(total)}`);
    }

    closeModal();
  }, [
    product,
    section,
    selectedSize,
    selectedAddons,
    draft,
    editing,
    addLine,
    replaceLine,
    closeModal,
    message,
    total,
  ]);

  return {
    visible: modal.visible,
    product,
    section,
    editing,
    sizes,
    draft,
    selectedSize,
    unitPrice,
    total,
    open,
    close: closeModal,
    setSize,
    setTemperature,
    setSweetness,
    toggleAddon,
    setQuantity,
    setNotes,
    submit,
  };
};
