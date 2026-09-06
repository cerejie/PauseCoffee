import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { Form, Input } from "antd";
import { useRegisterFormHook } from "../../../hook/account/register.form.hook";
import { cardSub, submit } from "../../../styles/admin/login.css";

interface RegisterFormProps {
  onRegistered: () => void;
}

/// Signing up creates a request, not an account with access — the copy has to
/// say so before the button is pressed, or the first sign-in reads as a bug.
const RegisterForm = ({ onRegistered }: RegisterFormProps) => {
  const { form, isSubmitting, onSubmit } = useRegisterFormHook({ onRegistered });

  return (
    <>
      <p className={cardSub}>
        Register with your email and we'll send it for approval. You'll be able to
        sign in once it's approved.
      </p>

      <Form form={form} layout="vertical" onFinish={onSubmit} requiredMark={false}>
        <Form.Item
          name="full_name"
          label="Full name"
          rules={[{ required: true, message: "Enter your name." }]}
        >
          <Input
            size="large"
            autoComplete="name"
            prefix={<UserOutlined style={{ opacity: 0.45 }} />}
            placeholder="Jamie Reyes"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Enter your email." },
            { type: "email", message: "That doesn't look like an email." },
          ]}
        >
          <Input
            size="large"
            autoComplete="email"
            prefix={<MailOutlined style={{ opacity: 0.45 }} />}
            placeholder="you@pausecoffee.ph"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: "Choose a password." },
            { min: 8, message: "Use at least 8 characters." },
          ]}
        >
          <Input.Password
            size="large"
            autoComplete="new-password"
            prefix={<LockOutlined style={{ opacity: 0.45 }} />}
            placeholder="At least 8 characters"
          />
        </Form.Item>

        <Form.Item
          name="confirm"
          label="Confirm password"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Type the password again." },
            ({ getFieldValue }) => ({
              validator: (_rule, value) =>
                !value || value === getFieldValue("password")
                  ? Promise.resolve()
                  : Promise.reject(new Error("The two passwords don't match.")),
            }),
          ]}
        >
          <Input.Password
            size="large"
            autoComplete="new-password"
            prefix={<LockOutlined style={{ opacity: 0.45 }} />}
            placeholder="••••••••"
          />
        </Form.Item>

        <button type="submit" className={submit} disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Request access"}
        </button>
      </Form>
    </>
  );
};

export default RegisterForm;
