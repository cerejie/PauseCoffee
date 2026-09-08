import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { PaymentMethodEnum, paymentMethodLabel } from "../../../enums/order.enum";
import {
  appSettingsQueryKey,
  onlineOrderingOpenQueryKey,
} from "../../../keys/query.keys";
import type {
  IPaymentOption,
  IStorefrontSettings,
} from "../../../models/data/settings/settings.response";
import { defaultOnlineSlug } from "../../../constants/online.constants";
import { settingsServices } from "../../../services/data/settings/settings.services";
import { menuImageUrl } from "../../../utils/storage.utils";

/// The shop as a customer sees it: whether it is taking orders, how to pay, and
/// how to reach it. Read by the online app, which has no session — the settings
/// row is anon-readable precisely so this works before anyone signs in.
///
/// Trading hours are answered by the database, not computed here. The trigger
/// in 0018 evaluates the window in Asia/Manila and will refuse the order; a
/// customer's device clock must not be able to disagree with it and show an
/// open shop that then rejects them at checkout.
export const useStorefrontSettingsHook = () => {
  const settingsQuery = useQuery({
    queryKey: [appSettingsQueryKey],
    queryFn: () => settingsServices.getSettings(),
    // Money details and trading hours change rarely; a minute of staleness
    // saves a request on every screen that renders the QR.
    staleTime: 60_000,
  });

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
    };
  }, [settings, isOpen]);

  return {
    storefront,
    isLoading: settingsQuery.isLoading || openQuery.isLoading,
    isError: settingsQuery.isError,
    refetch: settingsQuery.refetch,
  };
};
