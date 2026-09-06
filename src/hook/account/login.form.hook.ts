import { useMutation } from "@tanstack/react-query";
import { App, Form } from "antd";
import { useNavigate } from "react-router-dom";
import { AccessStatusEnum } from "../../enums/access.status.enum";
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

      // Signing in is not the same as having access. The guard would bounce
      // them straight back here with no explanation, so check up front and say
      // which of the three reasons it is. Signing back out keeps a session that
      // can do nothing from lingering in storage.
      const profile = await adminServices.getProfile(result.user.id);

      if (!profile) {
        await adminServices.signOut();
        throw new Error("That account isn't set up for the Pause admin app.");
      }

      if (profile.status === AccessStatusEnum.Pending) {
        await adminServices.signOut();
        throw new Error(
          "Your account is still waiting for approval. You'll be able to sign in once it's approved.",
        );
      }

      if (profile.status === AccessStatusEnum.Revoked) {
        await adminServices.signOut();
        throw new Error("Your access to the admin app has been revoked.");
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
