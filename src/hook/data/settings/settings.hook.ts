import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { PaymentMethodEnum, paymentMethodLabel } from "../../../enums/order.enum";
import {
  appSettingsQueryKey,
  onlineOrderingOpenQueryKey,
} from "../../../keys/query.keys";
import type {
  IAppSettings,
  IDiscount,
  IPaymentOption,
  IStorefrontSettings,
} from "../../../models/data/settings/settings.response";
import { defaultOnlineSlug } from "../../../constants/online.constants";
import { settingsServices } from "../../../services/data/settings/settings.services";
import { menuImageUrl } from "../../../utils/storage.utils";

const useAppSettingsQuery = () =>
  useQuery({
    queryKey: [appSettingsQueryKey],
    queryFn: () => settingsServices.getSettings(),
    // Money details and trading hours change rarely; a minute of staleness
    // saves a request on every screen that renders the QR.
    staleTime: 60_000,
  });

/// The live discount, or null when it is switched off or worth nothing.
/// numeric arrives from PostgREST as a string, hence the Number().
const toDiscount = (settings: IAppSettings | null): IDiscount | null => {
  if (!settings?.discount_enabled) return null;
  const value = Number(settings.discount_value ?? 0);
  return value > 0 ? { type: settings.discount_type, value } : null;
};

/// Just the discount, for the menu, the options drawer and the cart. Both the
/// in-store and the online app read it, and the in-store one has no business
/// polling the online trading window to learn a price.
export const useStorefrontDiscountHook = (): IDiscount | null => {
  const { data } = useAppSettingsQuery();
  return useMemo(() => toDiscount(data ?? null), [data]);
};

/// The shop as a customer sees it: whether it is taking orders, how to pay, and
/// how to reach it. Read by the online app, which has no session — the settings
/// row is anon-readable precisely so this works before anyone signs in.
///
/// Trading hours are answered by the database, not computed here. The trigger
/// in 0018 evaluates the window in Asia/Manila and will refuse the order; a
/// customer's device clock must not be able to disagree with it and show an
/// open shop that then rejects them at checkout.
export const useStorefrontSettingsHook = () => {
  const settingsQuery = useAppSettingsQuery();

  const openQuery = useQuery({
    queryKey: [onlineOrderingOpenQueryKey],
    queryFn: () => settingsServices.isOnlineOrderingOpen(),
    // Shorter: this one crosses an opening or closing time on its own.
    staleTime: 30_000,
    refetchInterval: 120_000,
  });

  const settings = settingsQuery.data ?? null;
  const isOpen = openQuery.data ?? true;

  const storefront = useMemo<IStorefrontSettings>(() => {
    const options: IPaymentOption[] = [];

    if (settings?.gcash_enabled) {
      options.push({
        method: PaymentMethodEnum.GCash,
        label: paymentMethodLabel[PaymentMethodEnum.GCash],
        accountName: settings.gcash_account_name,
        accountNumber: settings.gcash_account_number,
        bankName: null,
      });
    }

    if (settings?.bank_transfer_enabled) {
      options.push({
        method: PaymentMethodEnum.BankTransfer,
        label: paymentMethodLabel[PaymentMethodEnum.BankTransfer],
        accountName: settings.bank_account_name,
        accountNumber: settings.bank_account_number,
        bankName: settings.bank_name,
      });
    }

    return {
      isOnlineOrderingOpen: isOpen,
      // The switch is on but the clock says no — worth telling the customer
      // when the shop opens rather than a flat "closed".
      isOutsideHours: Boolean(settings?.online_ordering_enabled) && !isOpen,
      openTime: settings?.online_open_time ?? null,
      closeTime: settings?.online_close_time ?? null,
      contactPhone: settings?.shop_contact_phone ?? null,
      onlineSlug: settings?.online_slug ?? defaultOnlineSlug,
      qrUrl: menuImageUrl(settings?.payment_qr_path),
      paymentOptions: options,
      discount: toDiscount(settings),
    };
  }, [settings, isOpen]);

  return {
    storefront,
    isLoading: settingsQuery.isLoading || openQuery.isLoading,
    isError: settingsQuery.isError,
    refetch: settingsQuery.refetch,
  };
};
