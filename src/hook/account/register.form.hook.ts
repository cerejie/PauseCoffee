import { useMutation } from "@tanstack/react-query";
import { App, Form } from "antd";
import { adminServices } from "../../services/data/admin/admin.services";
import type { IRegisterRequest } from "../../models/data/user/user.request";
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

  const mutation = useMutation({
    mutationFn: async (values: IRegisterRequest) => {
      const result = await adminServices.signUp(
        values.full_name.trim(),
        values.email.trim(),
        values.password,
      );

      // With email confirmation switched off, signUp hands back a live session.
      // The account is pending either way, so drop it rather than leave a
      // signed-in user the guard would only bounce.
      if (result.session) await adminServices.signOut();
    },

    onSuccess: () => {
      form.resetFields();
      notification.success({
        message: "Request sent",
        description:
          "Your account needs to be approved before you can sign in. You'll be let in once it is.",
        duration: 6,
      });
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
