import { useEffect } from "react";
import { adminServices } from "../../services/data/admin/admin.services";
import { useSessionStore } from "../../store/common/session.store";
import { supabase } from "../../utils/supabase.utils";

/// Owns the auth lifecycle for the admin app: restores a stored session on
/// mount, follows sign-in/sign-out, and resolves the staff profile that is the
/// real authorisation check. Mounted once, by AdminGuard.
export const useSessionHook = () => {
  const session = useSessionStore((s) => s.session);
  const profile = useSessionStore((s) => s.profile);
  const ready = useSessionStore((s) => s.ready);
  const setSession = useSessionStore((s) => s.setSession);
  const setProfile = useSessionStore((s) => s.setProfile);
  const setReady = useSessionStore((s) => s.setReady);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async (userId: string | undefined) => {
      if (!userId) {
        if (!cancelled) setProfile(null);
        return;
      }
      try {
        const staff = await adminServices.getProfile(userId);
        if (!cancelled) setProfile(staff);
      } catch {
        // A profile read that fails is treated as "not staff" — the guard then
        // sends them to login rather than into a half-broken admin shell.
        if (!cancelled) setProfile(null);
      }
    };

    void supabase.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      await hydrate(data.session?.user.id);
      if (!cancelled) setReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      void hydrate(next?.user.id).then(() => setReady(true));
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
      // The listener dies with this mount, so anything that happens to the
      // session while the guard is unmounted -- a sign-in on /admin/login --
      // goes unrecorded. Lowering `ready` makes the next mount wait for a
      // fresh check instead of re-deciding on this mount's stale verdict.
      setReady(false);
    };
  }, [setProfile, setReady, setSession]);

  return {
    session,
    profile,
    ready,
    /// Signed in AND on the staff table — a bare auth user is not enough.
    isStaff: Boolean(session && profile),
  };
};
