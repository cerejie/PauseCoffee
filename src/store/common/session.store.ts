import type { Session } from "@supabase/supabase-js";
import type { AccessStatusEnum } from "../../enums/access.status.enum";
import type { UserRoleEnum } from "../../enums/role.enum";
import { create } from "zustand";

export interface IStaffProfile {
  id: string;
  full_name: string;
  email: string | null;
  role: UserRoleEnum;
  /// A profile row alone is no longer access — only `approved` is. A pending
  /// sign-up has a row here and gets nothing.
  status: AccessStatusEnum;
}

type States = {
  session: Session | null;
  profile: IStaffProfile | null;
  /// False until the first auth check resolves — the admin guard must not
  /// bounce to /admin/login while the stored session is still rehydrating.
  ready: boolean;
};

type Actions = {
  setSession: (session: Session | null) => void;
  setProfile: (profile: IStaffProfile | null) => void;
  setReady: (ready: boolean) => void;
};

/// Outside the reset wrapper on purpose: resetAllStores() runs on sign-out and
/// would otherwise fight the sign-out flow that is clearing this store itself.
export const useSessionStore = create<States & Actions>((set) => ({
  session: null,
  profile: null,
  ready: false,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setReady: (ready) => set({ ready }),
}));
