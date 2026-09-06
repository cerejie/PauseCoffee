import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { adminServices } from "../../services/data/admin/admin.services";
import { supabaseError } from "../../utils/supabase.utils";

export type EmailVerifyState = "verifying" | "confirmed" | "failed";

/// Long enough to read the screen, short enough that nobody has to press
/// anything to get on with signing in.
const redirectSeconds = 6;

/// Redeems the link from the sign-up email and hands the visitor back to the
/// login screen. Everything it does happens once, on mount: the token is
/// single-use, so this is the only chance it gets.
export const useVerifyEmailHook = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [state, setState] = useState<EmailVerifyState>("verifying");
  const [message, setMessage] = useState<string>();
  const [countdown, setCountdown] = useState(redirectSeconds);

  const startedRef = useRef(false);

  const goToLogin = useCallback(
    () => navigate("/admin/login", { replace: true }),
    [navigate],
  );

  useEffect(() => {
    // StrictMode runs effects twice. A confirmation token is spent the first
    // time it is redeemed, so a second run would fail a link that just worked.
    if (startedRef.current) return;
    startedRef.current = true;

    const tokenHash = params.get("token_hash");
    // Supabase reports a dead link by redirecting here with the reason on the
    // query string rather than by failing the request.
    const linkError = params.get("error_description") ?? params.get("error");

    const verify = async () => {
      try {
        if (linkError) throw new Error(linkError);

        if (tokenHash) {
          await adminServices.verifySignUpEmail(tokenHash);
        } else {
          // The stock Supabase template confirms the address at its own
          // endpoint and lands here with a session instead of a token, so
          // there is nothing left to redeem. No session means the visitor
          // reached this page some other way.
          const session = await adminServices.getSession();
          if (!session) {
            throw new Error("This link is no longer valid — it may already have been used.");
          }
        }

        // Confirmed is not approved: the profile behind this session is still
        // pending and can do nothing, so the session goes rather than sitting
        // in storage waiting to be bounced by the guard.
        try {
          await adminServices.signOut();
        } catch {
          // Verification is what mattered, and it succeeded.
        }

        setState("confirmed");
      } catch (error) {
        setMessage(supabaseError(error));
        setState("failed");
      }
    };

    void verify();
  }, [params]);

  useEffect(() => {
    if (state !== "confirmed") return;

    if (countdown <= 0) {
      goToLogin();
      return;
    }

    const timer = window.setTimeout(() => setCountdown((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [state, countdown, goToLogin]);

  return { state, message, countdown, goToLogin };
};
