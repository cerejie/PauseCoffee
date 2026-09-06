import type { AccessStatusEnum } from "../../../enums/access.status.enum";
import type { IUserAccount } from "../../../models/data/user/user.response";
import { supabase } from "../../../utils/supabase.utils";

/// Account administration — the superadmin's screen. Reads go through RLS on
/// profiles (which returns only your own row to anyone else); both writes go
/// through SECURITY DEFINER RPCs, because "not yourself, not another
/// superadmin" is a rule a policy cannot express.
export const userServices = {
  getUsers: async (): Promise<IUserAccount[]> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, status, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as IUserAccount[];
  },

  setAccessStatus: async (userId: string, status: AccessStatusEnum) => {
    const { error } = await supabase.rpc("set_access_status", {
      p_user_id: userId,
      p_status: status,
    });

    if (error) throw error;
  },

  /// Removes the auth user for good; the profile row goes with it on cascade.
  deleteUser: async (userId: string) => {
    const { error } = await supabase.rpc("delete_user", { p_user_id: userId });
    if (error) throw error;
  },
};
