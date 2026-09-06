import { useMutation } from "@tanstack/react-query";
import { App, Form } from "antd";
import { confirmEmailModalKey } from "../../keys/modal.keys";
import { adminServices } from "../../services/data/admin/admin.services";
import type { IRegisterRequest } from "../../models/data/user/user.request";
import type { IEmailConfirmPrompt } from "../../models/data/user/user.response";
import { useModal } from "../common/modal.hook";
import { supabaseError } from "../../utils/supabase.utils";

interface RegisterFormOptions {
  /// Called once the request is in. The login screen uses it to drop the
  /// visitor back on the sign-in tab, where the next thing they do belongs.
  onRegistered: () => void;
}

/// Self-service sign-up for the admin app. It creates an auth user and nothing
/// else: the trigger behind it writes a *pending* profile, which satisfies none
/// of the database's access checks until a superadmin approves it.
export const useRegisterFormHook = ({ onRegistered }: RegisterFormOptions) => {
  const [form] = Form.useForm<IRegisterRequest>();
  const { notification } = App.useApp();
  const { openModal } = useModal<IEmailConfirmPrompt>(confirmEmailModalKey);

  const mutation = useMutation({
    mutationFn: async (values: IRegisterRequest): Promise<IEmailConfirmPrompt> => {
      const email = values.email.trim();
      const result = await adminServices.signUp(
        values.full_name.trim(),
        email,
        values.password,
      );

      // A session here means the project has email confirmation switched off:
      // nothing was sent, and the account is already waiting on approval. Drop
      // the session either way — it is a signed-in user the guard would bounce.
      const emailSent = !result.session;
      if (result.session) await adminServices.signOut();

      return { email, email_sent: emailSent };
    },

    onSuccess: (prompt) => {
      form.resetFields();
      openModal(prompt);
      onRegistered();
    },

    onError: (error) => {
      notification.error({
        message: "Couldn't create that account",
        description: supabaseError(error),
      });
    },
  });

  return {
    form,
    isSubmitting: mutation.isPending,
    onSubmit: (values: IRegisterRequest) => mutation.mutate(values),
  };
};
