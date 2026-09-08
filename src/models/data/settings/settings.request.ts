import type { Dayjs } from "dayjs";
import type { IAppSettings } from "./settings.response";

/// A partial write. Each tab of the Settings screen sends only its own fields,
/// so saving Payment cannot clobber a trading window someone changed on the
/// other tab. updated_at / updated_by are excluded because the database stamps
/// them itself (0018), exactly as it does the order timestamps.
export type IAppSettingsPatch = Partial<
  Omit<IAppSettings, "updated_at" | "updated_by">
>;

/// The Shop tab's field shape. antd TimePicker works in Dayjs, so the form
/// carries Dayjs and the hook converts to "HH:mm:ss" on the way out — the
/// conversion lives in one place rather than in the component.
export interface IShopSettingsFormRequest {
  online_ordering_enabled: boolean;
  online_open_time?: Dayjs | null;
  online_close_time?: Dayjs | null;
  shop_contact_phone?: string;
  online_slug: string;
}

/// The Payment tab's field shape. `payment_qr_path` is written by the upload
/// tile rather than typed, and is what the customer's QR panel renders.
export interface IPaymentSettingsFormRequest {
  payment_qr_path?: string | null;
  gcash_enabled: boolean;
  gcash_account_name?: string;
  gcash_account_number?: string;
  bank_transfer_enabled: boolean;
  bank_name?: string;
  bank_account_name?: string;
  bank_account_number?: string;
}
