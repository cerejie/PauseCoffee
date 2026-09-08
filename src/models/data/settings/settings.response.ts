import type { PaymentMethodEnum } from "../../../enums/order.enum";

/// The single row of public.app_settings (migration 0018).
///
/// Every field here is readable with the anon key, because the online checkout
/// renders the QR, the account details and the contact number to a customer who
/// is not signed in. Nothing secret belongs in this shape.
export interface IAppSettings {
  online_ordering_enabled: boolean;
  /// "HH:mm:ss" in Asia/Manila, or null for "no schedule — the switch decides".
  online_open_time: string | null;
  online_close_time: string | null;
  shop_contact_phone: string | null;
  /// The first path segment the online app answers on. Constrained by the
  /// database to lowercase kebab and to nothing that collides with a static
  /// route, so a customer's link cannot be broken from the admin screen.
  online_slug: string;

  /// Object path in the public menu-images bucket, never a URL — same
  /// convention as products.image_path.
  payment_qr_path: string | null;

  gcash_enabled: boolean;
  gcash_account_name: string | null;
  gcash_account_number: string | null;

  bank_transfer_enabled: boolean;
  bank_name: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;

  updated_at: string;
  updated_by: string | null;
}

/// One payable account as the online checkout renders it. Built from the
/// settings row so the customer screen never has to know which columns belong
/// to which method.
export interface IPaymentOption {
  method: PaymentMethodEnum;
  label: string;
  accountName: string | null;
  accountNumber: string | null;
  /// Only the bank transfer has one; GCash is identified by the QR.
  bankName: string | null;
}

/// What the customer-facing side actually consumes: the QR resolved to a URL,
/// the methods that are both enabled and configured, and whether the shop is
/// taking orders at this moment.
export interface IStorefrontSettings {
  isOnlineOrderingOpen: boolean;
  /// True when the switch is on but the clock says otherwise — lets the online
  /// app say "we open at 8am" rather than a flat "closed".
  isOutsideHours: boolean;
  openTime: string | null;
  closeTime: string | null;
  contactPhone: string | null;
  onlineSlug: string;
  qrUrl: string | null;
  paymentOptions: IPaymentOption[];
}
