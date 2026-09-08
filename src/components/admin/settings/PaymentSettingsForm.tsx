import { Button, Form, Input, Switch } from "antd";
import BrandLoader from "../../common/loader/BrandLoader";
import PaymentQrUpload from "./PaymentQrUpload";
import { usePaymentSettingsHook } from "../../../hook/data/admin/settings.form.hook";
import {
  divider,
  fieldGrid,
  fieldLabel,
  footer,
  panel,
  panelHead,
  panelHint,
  panelTitle,
  stack,
  toggleCopy,
  toggleHint,
  toggleRow,
  toggleTitle,
} from "../../../styles/admin/settings.css";

/// Where customers send their money, and what they are shown while sending it.
/// Everything on this screen is rendered to a signed-out stranger on the online
/// checkout, which is exactly what an account number is for — but it is also
/// why nothing resembling a password or a key may ever be added here.
const PaymentSettingsForm = () => {
  const { form, isLoading, isSaving, onSubmit } = usePaymentSettingsHook();

  const gcashOn = Form.useWatch("gcash_enabled", form);
  const bankOn = Form.useWatch("bank_transfer_enabled", form);

  if (isLoading) return <BrandLoader label="Loading settings" />;

  return (
    <Form form={form} layout="vertical" onFinish={onSubmit} requiredMark={false}>
      <div className={stack}>
        <section className={panel}>
          <div className={panelHead}>
            <h2 className={panelTitle}>Payment QR</h2>
            <p className={panelHint}>
              Customers scan this, pay, then upload their receipt. No receipt, no
              order — the server refuses an online order without one.
            </p>
          </div>

          <Form.Item name="payment_qr_path" style={{ marginBottom: 0 }}>
            <PaymentQrUpload />
          </Form.Item>
        </section>

        <section className={panel}>
          <div className={panelHead}>
            <h2 className={panelTitle}>GCash</h2>
            <p className={panelHint}>
              The name and number are shown beside the QR, so a customer can
              check they are paying the right shop before they send anything.
            </p>
          </div>

          <div className={toggleRow}>
            <div className={toggleCopy}>
              <p className={toggleTitle}>Accept GCash</p>
              <p className={toggleHint}>Offered as a payment choice at checkout.</p>
            </div>
            <Form.Item
              name="gcash_enabled"
              valuePropName="checked"
              style={{ marginBottom: 0 }}
            >
              <Switch />
            </Form.Item>
          </div>

          {gcashOn ? (
            <>
              <div className={divider} />
              <div className={fieldGrid}>
                <div>
                  <label className={fieldLabel} htmlFor="gcash_account_name">
                    Account name
                  </label>
                  <Form.Item name="gcash_account_name" style={{ marginBottom: 16 }}>
                    <Input id="gcash_account_name" size="large" maxLength={80} />
                  </Form.Item>
                </div>

                <div>
                  <label className={fieldLabel} htmlFor="gcash_account_number">
                    Mobile number
                  </label>
                  <Form.Item name="gcash_account_number" style={{ marginBottom: 16 }}>
                    <Input
                      id="gcash_account_number"
                      size="large"
                      maxLength={40}
                      placeholder="0917 123 4567"
                    />
                  </Form.Item>
                </div>
              </div>
            </>
          ) : null}
        </section>

        <section className={panel}>
          <div className={panelHead}>
            <h2 className={panelTitle}>Bank transfer</h2>
            <p className={panelHint}>
              For customers who would rather send it from their bank. Off by
              default — turn it on only once these details are filled in.
            </p>
          </div>

          <div className={toggleRow}>
            <div className={toggleCopy}>
              <p className={toggleTitle}>Accept bank transfer</p>
              <p className={toggleHint}>
                A transfer takes longer to land, so check it cleared before you
                approve the order.
              </p>
            </div>
            <Form.Item
              name="bank_transfer_enabled"
              valuePropName="checked"
              style={{ marginBottom: 0 }}
            >
              <Switch />
            </Form.Item>
          </div>

          {bankOn ? (
            <>
              <div className={divider} />
              <div className={fieldGrid}>
                <div>
                  <label className={fieldLabel} htmlFor="bank_name">
                    Bank
                  </label>
                  <Form.Item name="bank_name" style={{ marginBottom: 16 }}>
                    <Input
                      id="bank_name"
                      size="large"
                      maxLength={60}
                      placeholder="e.g. BPI"
                    />
                  </Form.Item>
                </div>

                <div>
                  <label className={fieldLabel} htmlFor="bank_account_name">
                    Account name
                  </label>
                  <Form.Item name="bank_account_name" style={{ marginBottom: 16 }}>
                    <Input id="bank_account_name" size="large" maxLength={80} />
                  </Form.Item>
                </div>

                <div>
                  <label className={fieldLabel} htmlFor="bank_account_number">
                    Account number
                  </label>
                  <Form.Item name="bank_account_number" style={{ marginBottom: 16 }}>
                    <Input id="bank_account_number" size="large" maxLength={40} />
                  </Form.Item>
                </div>
              </div>
            </>
          ) : null}
        </section>

        <div className={footer}>
          <Button type="primary" htmlType="submit" size="large" loading={isSaving}>
            Save payment details
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default PaymentSettingsForm;
