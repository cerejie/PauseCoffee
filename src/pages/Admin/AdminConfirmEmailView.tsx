import { CheckOutlined, WarningOutlined } from "@ant-design/icons";
import { Button } from "antd";
import BrandMark from "../../components/common/brand/BrandMark";
import BrandLoader from "../../components/common/loader/BrandLoader";
import { useVerifyEmailHook } from "../../hook/account/verify.email.hook";
import {
  actions,
  badge,
  badgeDanger,
  badgeSuccess,
  copy,
  countdown as countdownText,
  panel,
  title,
} from "../../styles/admin/confirm.css";
import {
  brandCopy,
  brandFoot,
  brandHeadline,
  brandPane,
  brandTop,
  card,
  formPane,
  shell,
} from "../../styles/admin/login.css";

/// Where the link in the sign-up email lands. It shares the login screen's
/// frame on purpose — the visitor arrives from their inbox and has to
/// recognise, in one glance, that they are back at the right place.
const AdminConfirmEmailView = () => {
  const { state, message, countdown, goToLogin } = useVerifyEmailHook();

  return (
    <div className={shell}>
      <aside className={brandPane}>
        <div className={brandTop}>
          <BrandMark tone="light" />
        </div>

        <div>
          <h1 className={brandHeadline}>Almost in.</h1>
          <p className={brandCopy}>
            Confirming your address is the first half. A superadmin lets the account
            through the door.
          </p>
        </div>

        <p className={brandFoot}>Approved accounts only</p>
      </aside>

      <section className={formPane}>
        <div className={card}>
          {state === "verifying" ? (
            <BrandLoader label="Confirming your email" />
          ) : null}

          {state === "confirmed" ? (
            <div className={panel}>
              <span className={`${badge} ${badgeSuccess}`}>
                <CheckOutlined />
              </span>

              <h2 className={title}>Email confirmed</h2>

              <p className={copy}>
                Thanks — your address is verified. Your request is now with the team; a
                superadmin approves the account, and you can sign in the moment it is.
              </p>

              <div className={actions}>
                <Button type="primary" size="large" block onClick={goToLogin}>
                  Go to sign in
                </Button>
                <span className={countdownText}>
                  Taking you there in {countdown}s…
                </span>
              </div>
            </div>
          ) : null}

          {state === "failed" ? (
            <div className={panel}>
              <span className={`${badge} ${badgeDanger}`}>
                <WarningOutlined />
              </span>

              <h2 className={title}>That link didn't work</h2>

              <p className={copy}>
                {message ??
                  "This confirmation link is no longer valid — it may already have been used."}
              </p>

              <p className={copy}>
                Confirmation links last 24 hours. Sign up again with the same address to
                get a fresh one.
              </p>

              <div className={actions}>
                <Button type="primary" size="large" block onClick={goToLogin}>
                  Back to sign in
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default AdminConfirmEmailView;
