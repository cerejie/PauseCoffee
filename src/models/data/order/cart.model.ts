import type { TemperatureEnum } from "../../../enums/order.enum";
import type { IAddon } from "../menu/menu.response";

/// A configured drink sitting in the cart. It carries the display copy and the
/// prices it was added at so the cart can render and total without refetching;
/// the server still re-prices everything at checkout, so a stale price here is
/// a display bug, never a charging bug.
export interface ICartLine {
  /// Stable identity for this configuration — same drink with different add-ons
  /// is a different line, and re-adding an identical one merges quantities.
  key: string;
  productId: string;
  productName: string;
  categoryId: string;
  categorySlug: string;
  accentColor: string;
  /// Copied in alongside the rest of the display copy so the cart renders
  /// without holding on to the menu it was built from.
  imageUrl: string | null;
  sizeId: string;
  sizeLabel: string;
  unitPrice: number;
  temperature: TemperatureEnum | null;
  sweetness: string | null;
  addons: Pick<IAddon, "id" | "name" | "price">[];
  quantity: number;
  notes: string | null;
}

export const cartLineUnitTotal = (line: ICartLine): number =>
  line.unitPrice + line.addons.reduce((sum, addon) => sum + Number(addon.price), 0);

export const cartLineTotal = (line: ICartLine): number =>
  cartLineUnitTotal(line) * line.quantity;
