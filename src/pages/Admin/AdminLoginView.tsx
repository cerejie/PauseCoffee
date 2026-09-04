import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Form, Input } from "antd";
import { Link } from "react-router-dom";
import BrandMark from "../../components/common/brand/BrandMark";
import { useLoginFormHook } from "../../hook/account/login.form.hook";
import {
  backHome,
  brandCopy,
  brandFoot,
  brandHeadline,
  brandPane,
  brandTop,
  card,
  cardSub,
  cardTitle,
  formPane,
  shell,
  submit,
} from "../../styles/admin/login.css";

const AdminLoginView = () => {
  const { form, isSubmitting, onSubmit } = useLoginFormHook();

  return (
    <div className={shell}>
      <aside className={brandPane}>
        <div className={brandTop}>
          <BrandMark tone="light" />
        </div>

        <div>
          <h1 className={brandHeadline}>Every order, the moment it lands.</h1>
          <p className={brandCopy}>
            The counter view for Pause Coffee — a live queue, one tap per stage, and the
            full order history behind it.
          </p>
        </div>

        <p className={brandFoot}>Staff access only</p>
      </aside>

      <section className={formPane}>
        <div className={card}>
          <h2 className={cardTitle}>Sign in</h2>
          <p className={cardSub}>
            Use the staff account your manager set up for you.
          </p>

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

          <Link to="/" className={backHome}>
            ← Back to the menu
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AdminLoginView;
