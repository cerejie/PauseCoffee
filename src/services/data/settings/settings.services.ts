import type { IAppSettingsPatch } from "../../../models/data/settings/settings.request";
import type { IAppSettings } from "../../../models/data/settings/settings.response";
import { supabase } from "../../../utils/supabase.utils";

/// There is exactly one settings row and the database guarantees it (0018's
/// `id boolean primary key check (id)`), so every call here addresses `id` and
/// none of them has to decide which row it wants.
const SINGLETON_ID = true;

export const settingsServices = {
  /// Public read. The online checkout calls this before a customer signs in —
  /// it renders the QR they are about to pay.
  getSettings: async (): Promise<IAppSettings | null> => {
    const { data, error } = await supabase
      .from("app_settings")
      .select("*")
      .eq("id", SINGLETON_ID)
      .maybeSingle();

    if (error) throw error;
    return (data as unknown as IAppSettings | null) ?? null;
  },

  /// Asks the database, not the browser, whether the shop is open: the trading
  /// window is evaluated in Asia/Manila, and a customer's device clock or
  /// timezone must not be able to disagree with the trigger that will enforce
  /// it at checkout.
  isOnlineOrderingOpen: async (): Promise<boolean> => {
    const { data, error } = await supabase.rpc("online_ordering_open");

    if (error) throw error;
    // Fails open, matching the trigger: a missing settings row must not
    // silently stop the shop from taking money.
    return (data as boolean | null) ?? true;
  },

  /// Admin write. A partial patch, so each tab saves its own fields and cannot
  /// overwrite what the other tab is showing.
  updateSettings: async (patch: IAppSettingsPatch): Promise<IAppSettings> => {
    const { data, error } = await supabase
      .from("app_settings")
      .update(patch)
      .eq("id", SINGLETON_ID)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as IAppSettings;
  },
};
