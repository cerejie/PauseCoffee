import { App } from "antd";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { UserRoleEnum, userRoleLabel } from "../../enums/role.enum";
import { adminServices } from "../../services/data/admin/admin.services";
import { resetAllStores } from "../../store/common/reset.store";
import { useSessionStore } from "../../store/common/session.store";
import { supabaseError } from "../../utils/supabase.utils";

/// Who is signed in and how they get out. Shared by the sider's account menu
/// and the header button the phone layout falls back to, so the sign-out path
/// — clear the stores, then leave — exists in exactly one place.
export const useAdminAccountHook = () => {
  const navigate = useNavigate();
  const { notification } = App.useApp();
  const profile = useSessionStore((s) => s.profile);

  const signOut = useCallback(async () => {
    try {
      await adminServices.signOut();
      resetAllStores();
      navigate("/admin/login", { replace: true });
    } catch (error) {
      notification.error({
        message: "Couldn't sign out",
        description: supabaseError(error),
      });
    }
  }, [navigate, notification]);

  const displayName = profile?.full_name || "Staff";

  return {
    profile,
    displayName,
    roleLabel: profile ? (userRoleLabel[profile.role] ?? profile.role) : userRoleLabel[UserRoleEnum.Admin],
    initial: displayName.slice(0, 1).toUpperCase(),
    signOut,
  };
};
