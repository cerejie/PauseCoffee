import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Form } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useEffect } from "react";
import {
  appSettingsQueryKey,
  onlineOrderingOpenQueryKey,
} from "../../../keys/query.keys";
import type {
  IAppSettingsPatch,
  IPaymentSettingsFormRequest,
  IShopSettingsFormRequest,
} from "../../../models/data/settings/settings.request";
import { settingsServices } from "../../../services/data/settings/settings.services";
import { supabaseError } from "../../../utils/supabase.utils";

/// Postgres `time` arrives as "HH:mm:ss". Parsed against a fixed date rather
/// than with a format string, which would need dayjs's customParseFormat plugin
/// loaded app-wide for two fields.
const toDayjs = (value: string | null | undefined): Dayjs | null =>
  value ? dayjs(`1970-01-01T${value}`) : null;

const toTime = (value: Dayjs | null | undefined): string | null =>
  value ? value.format("HH:mm:ss") : null;

/// Shared by both Settings tabs: one query (React Query dedupes the key), one
/// mutation shape, and one invalidation. Each tab still sends only its own
/// fields, so saving Payment cannot clobber the trading window.
const useSettingsMutation = (successMessage: string) => {
  const queryClient = useQueryClient();
  const { notification } = App.useApp();

  return useMutation({
    mutationFn: (patch: IAppSettingsPatch) => settingsServices.updateSettings(patch),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [appSettingsQueryKey] });
      // The trading window may have moved, and the customer app reads it from
      // its own key.
      void queryClient.invalidateQueries({ queryKey: [onlineOrderingOpenQueryKey] });

      notification.success({
        message: successMessage,
        placement: "bottomRight",
        duration: 2.5,
      });
    },

    onError: (error) => {
      notification.error({
        message: "Couldn't save that",
        description: supabaseError(error),
      });
    },
  });
};

const useSettingsQuery = () =>
  useQuery({
    queryKey: [appSettingsQueryKey],
    queryFn: () => settingsServices.getSettings(),
  });

/// The Shop tab — the kill switch, the trading window and the contact number.
export const useShopSettingsHook = () => {
  const [form] = Form.useForm<IShopSettingsFormRequest>();
  const query = useSettingsQuery();
  const mutation = useSettingsMutation("Shop settings saved");

  // initialValues only applies on mount, and the row arrives after it.
  useEffect(() => {
    if (!query.data) return;

    form.setFieldsValue({
      online_ordering_enabled: query.data.online_ordering_enabled,
      online_open_time: toDayjs(query.data.online_open_time),
      online_close_time: toDayjs(query.data.online_close_time),
      shop_contact_phone: query.data.shop_contact_phone ?? undefined,
      online_slug: query.data.online_slug,
    });
  }, [query.data, form]);

  return {
    form,
    settings: query.data ?? null,
    isLoading: query.isLoading,
    isSaving: mutation.isPending,
    onSubmit: (values: IShopSettingsFormRequest) =>
      mutation.mutate({
        online_ordering_enabled: values.online_ordering_enabled,
        online_open_time: toTime(values.online_open_time),
        online_close_time: toTime(values.online_close_time),
        shop_contact_phone: values.shop_contact_phone?.trim() || null,
        online_slug: values.online_slug.trim().toLowerCase(),
      }),
  };
};

/// The Payment tab — the QR and the account details the online checkout shows.
export const usePaymentSettingsHook = () => {
  const [form] = Form.useForm<IPaymentSettingsFormRequest>();
  const query = useSettingsQuery();
  const mutation = useSettingsMutation("Payment details saved");

  useEffect(() => {
    if (!query.data) return;

    form.setFieldsValue({
      payment_qr_path: query.data.payment_qr_path,
      gcash_enabled: query.data.gcash_enabled,
      gcash_account_name: query.data.gcash_account_name ?? undefined,
      gcash_account_number: query.data.gcash_account_number ?? undefined,
      bank_transfer_enabled: query.data.bank_transfer_enabled,
      bank_name: query.data.bank_name ?? undefined,
      bank_account_name: query.data.bank_account_name ?? undefined,
      bank_account_number: query.data.bank_account_number ?? undefined,
    });
  }, [query.data, form]);

  return {
    form,
    settings: query.data ?? null,
    isLoading: query.isLoading,
    isSaving: mutation.isPending,
    onSubmit: (values: IPaymentSettingsFormRequest) =>
      mutation.mutate({
        payment_qr_path: values.payment_qr_path ?? null,
        gcash_enabled: values.gcash_enabled,
        gcash_account_name: values.gcash_account_name?.trim() || null,
        gcash_account_number: values.gcash_account_number?.trim() || null,
        bank_transfer_enabled: values.bank_transfer_enabled,
        bank_name: values.bank_name?.trim() || null,
        bank_account_name: values.bank_account_name?.trim() || null,
        bank_account_number: values.bank_account_number?.trim() || null,
      }),
  };
};
