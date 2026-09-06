import { useMutation } from "@tanstack/react-query";
import { App } from "antd";
import { useEffect, useState } from "react";
import { resendCooldownSeconds } from "../../constants/auth.constants";
import { confirmEmailModalKey } from "../../keys/modal.keys";
import type { IEmailConfirmPrompt } from "../../models/data/user/user.response";
import { adminServices } from "../../services/data/admin/admin.services";
import { useModal } from "../common/modal.hook";
import { supabaseError } from "../../utils/supabase.utils";

/// Drives the modal that stands between "Request access" and the inbox. The
/// prompt itself is put in the store by useRegisterFormHook; this hook owns
/// only what the modal does while it is open — resending, and the cooldown
/// that keeps the visitor from tripping Supabase's rate limit.
export const useConfirmEmailHook = () => {
  const { modal, closeModal } = useModal<IEmailConfirmPrompt>(confirmEmailModalKey);
  const { notification } = App.useApp();

  // Nothing outside the modal reads the countdown, and it is meaningless once
  // the modal is gone — the one case a plain useState is the right home.
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const prompt = modal.data;

  const resend = useMutation({
    mutationFn: async () => {
      if (!prompt) throw new Error("There's no address to send to.");
      await adminServices.resendSignUpEmail(prompt.email);
    },

    onSuccess: () => {
      setCooldown(resendCooldownSeconds);
      notification.success({
        message: "Sent again",
        description: `Another confirmation link is on its way to ${prompt?.email}.`,
        duration: 5,
      });
    },

    onError: (error) => {
      notification.error({
        message: "Couldn't send that again",
        description: supabaseError(error),
      });
    },
  });

  const close = () => {
    setCooldown(0);
    closeModal();
  };

  return {
    prompt,
    visible: Boolean(modal.visible && prompt),
    cooldown,
    isResending: resend.isPending,
    resend: () => resend.mutate(),
    close,
  };
};
