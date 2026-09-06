import { MailOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import { useConfirmEmailHook } from "../../../hook/account/confirm.email.hook";
import { useBrandVars } from "../../../hook/common/brand.hook";
import {
  actions,
  address,
  badge,
  copy,
  panel,
  step,
  stepMark,
  steps,
  title,
} from "../../../styles/admin/confirm.css";

/// The gate between "Request access" and the inbox. Sign-up ends here rather
/// than in a toast because the visitor has to be told to go and do something
/// in another application — and told which address it went to, while the typo
/// is still fixable.
const ConfirmEmailModal = () => {
  const { prompt, visible, cooldown, isResending, resend, close } = useConfirmEmailHook();
  // Modals portal to <body>, outside the root that carries the style contract.
  const brandVars = useBrandVars();

  const emailSent = prompt?.email_sent ?? false;

  return (
    <Modal open={visible} onCancel={close} centered width={430} footer={null} destroyOnHidden>
      <div className={panel} style={brandVars}>
        <span className={badge}>
          <MailOutlined />
        </span>

        <h3 className={title}>{emailSent ? "Confirm your email" : "Request sent"}</h3>

        <p className={copy}>
          {emailSent
            ? "We've sent a confirmation link to"
            : "Your request for access has been recorded for"}
        </p>

        <span className={address}>{prompt?.email}</span>

        {emailSent ? (
          <ul className={steps}>
            <li className={step}>
              <span className={stepMark}>1</span>
              <span>Open the email and press <strong>Confirm my email</strong>.</span>
            </li>
            <li className={step}>
              <span className={stepMark}>2</span>
              <span>You'll be brought back here to sign in.</span>
            </li>
            <li className={step}>
              <span className={stepMark}>3</span>
              <span>
                A superadmin approves the account — sign in once that's done. The link
                expires in 24 hours; nothing stops you from asking for another.
              </span>
            </li>
          </ul>
        ) : (
          <p className={copy}>
            A superadmin approves the account before it can sign in. You'll be let in
            once it is.
          </p>
        )}

        <div className={actions}>
          <Button type="primary" size="large" block onClick={close}>
            Back to sign in
          </Button>

          {emailSent ? (
            <Button
              type="text"
              block
              loading={isResending}
              disabled={cooldown > 0}
              onClick={resend}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Didn't get it? Send it again"}
            </Button>
          ) : null}
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmEmailModal;
