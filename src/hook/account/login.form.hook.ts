import { useMutation } from "@tanstack/react-query";
import { App, Form } from "antd";
import { useNavigate } from "react-router-dom";
import { adminServices } from "../../services/data/admin/admin.services";
import { supabaseError } from "../../utils/supabase.utils";

export interface ILoginRequest {
  email: string;
  password: string;
}

export const useLoginFormHook = () => {
  const [form] = Form.useForm<ILoginRequest>();
  const { notification } = App.useApp();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (values: ILoginRequest) => {
      const result = await adminServices.signIn(values.email.trim(), values.password);

      // Signing in is not the same as being staff. Without a profiles row the
      // guard would bounce them straight back here with no explanation, so
      // check it up front and say why.
      const profile = await adminServices.getProfile(result.user.id);
      if (!profile) {
        await adminServices.signOut();
        throw new Error("That account isn't set up for the Pause admin app.");
      }

      return profile;
    },

    onSuccess: (profile) => {
      notification.success({
        message: `Welcome back, ${profile.full_name || "there"}`,
        placement: "bottomRight",
        duration: 2.5,
      });
      navigate("/admin/queue", { replace: true });
    },

    onError: (error) => {
      notification.error({
        message: "Couldn't sign you in",
        description: supabaseError(error),
      });
    },
  });

  return {
    form,
    isSubmitting: mutation.isPending,
    onSubmit: (values: ILoginRequest) => mutation.mutate(values),
  };
};
