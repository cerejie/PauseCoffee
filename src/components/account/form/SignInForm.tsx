import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Form, Input } from "antd";
import { useLoginFormHook } from "../../../hook/account/login.form.hook";
import { cardSub, submit } from "../../../styles/admin/login.css";

const SignInForm = () => {
  const { form, isSubmitting, onSubmit } = useLoginFormHook();

  return (
    <>
      <p className={cardSub}>Use the admin account that was approved for you.</p>

      <Form form={form} layout="vertical" onFinish={onSubmit} requiredMark={false}>
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
            autoComplete="username"
            prefix={<MailOutlined style={{ opacity: 0.45 }} />}
            placeholder="barista@pausecoffee.ph"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Enter your password." }]}
        >
          <Input.Password
            size="large"
            autoComplete="current-password"
            prefix={<LockOutlined style={{ opacity: 0.45 }} />}
            placeholder="••••••••"
          />
        </Form.Item>

        <button type="submit" className={submit} disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </Form>
    </>
  );
};

export default SignInForm;
