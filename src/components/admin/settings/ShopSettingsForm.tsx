import { CheckCircleFilled, CopyOutlined, StopFilled } from "@ant-design/icons";
import { App, Button, Form, Input, Switch, TimePicker } from "antd";
import {
  isReservedOnlineSlug,
  onlineOrderUrl,
  onlineSlugMaxLength,
  onlineSlugMinLength,
  onlineSlugPattern,
} from "../../../constants/online.constants";
import BrandLoader from "../../common/loader/BrandLoader";
import { useShopSettingsHook } from "../../../hook/data/admin/settings.form.hook";
import { useStorefrontSettingsHook } from "../../../hook/data/settings/settings.hook";
import {
  divider,
  fieldFull,
  fieldGrid,
  fieldLabel,
  footer,
  panel,
  panelHead,
  panelHint,
  panelTitle,
  statusNote,
  statusNoteOpen,
  statusNoteShut,
  stack,
  toggleCopy,
  toggleHint,
  toggleRow,
  toggleTitle,
} from "../../../styles/admin/settings.css";

/// The shop's own state: whether it is taking online orders, when, on what
/// link, and the number a customer can ring. Saved as one form because these
/// four answers are read together by the online app.
const ShopSettingsForm = () => {
  const { form, isLoading, isSaving, onSubmit } = useShopSettingsHook();
  const { storefront } = useStorefrontSettingsHook();
  const { message } = App.useApp();

  // Watched so the link preview and the closed/open banner track what is on
  // screen rather than what was last saved.
  const slug = Form.useWatch("online_slug", form);
  const enabled = Form.useWatch("online_ordering_enabled", form);

  const link = onlineOrderUrl(slug || storefront.onlineSlug);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      message.success("Link copied");
    } catch {
      // Clipboard is blocked on an insecure origin, and on some in-app
      // browsers. The link is on screen and selectable either way.
      message.info("Select the link above to copy it");
    }
  };

  if (isLoading) return <BrandLoader label="Loading settings" />;

  return (
    <Form form={form} layout="vertical" onFinish={onSubmit} requiredMark={false}>
      <div className={stack}>
        <section className={panel}>
          <div className={panelHead}>
            <h2 className={panelTitle}>Online ordering</h2>
            <p className={panelHint}>
              Turn this off when you close, run out, or just want a quiet
              afternoon. Orders are refused by the server, not merely hidden —
              nobody can pay for something you are not making.
            </p>
          </div>

          <div className={toggleRow}>
            <div className={toggleCopy}>
              <p className={toggleTitle}>Accept online orders</p>
              <p className={toggleHint}>
                The in-store app at the counter keeps working either way.
              </p>
            </div>
            <Form.Item
              name="online_ordering_enabled"
              valuePropName="checked"
              style={{ marginBottom: 0 }}
            >
              <Switch />
            </Form.Item>
          </div>

          {enabled ? (
            storefront.isOutsideHours ? (
              <div className={`${statusNote} ${statusNoteShut}`}>
                <StopFilled />
                Switched on, but outside your opening hours — customers cannot
                order right now.
              </div>
            ) : (
              <div className={`${statusNote} ${statusNoteOpen}`}>
                <CheckCircleFilled />
                Taking orders right now.
              </div>
            )
          ) : (
            <div className={`${statusNote} ${statusNoteShut}`}>
              <StopFilled />
              Online ordering is off. Customers see a closed notice.
            </div>
          )}

          <div className={divider} />

          <div className={fieldGrid}>
            <div>
              <label className={fieldLabel}>Opens at</label>
              <Form.Item name="online_open_time" style={{ marginBottom: 16 }}>
                <TimePicker
                  use12Hours
                  format="h:mm A"
                  minuteStep={15}
                  style={{ width: "100%" }}
                  placeholder="Any time"
                />
              </Form.Item>
            </div>

            <div>
              <label className={fieldLabel}>Closes at</label>
              <Form.Item name="online_close_time" style={{ marginBottom: 16 }}>
                <TimePicker
                  use12Hours
                  format="h:mm A"
                  minuteStep={15}
                  style={{ width: "100%" }}
                  placeholder="Any time"
                />
              </Form.Item>
            </div>

            <p className={`${panelHint} ${fieldFull}`} style={{ marginTop: 0 }}>
              Leave both empty to rely on the switch alone. Times are Philippine
              time, and the window may run past midnight.
            </p>
          </div>
        </section>

        <section className={panel}>
          <div className={panelHead}>
            <h2 className={panelTitle}>Customer link</h2>
            <p className={panelHint}>
              The web address customers use to order online. Change it whenever
              you like — the app starts answering on the new one as soon as you
              save.
            </p>
          </div>

          <div>
            <label className={fieldLabel} htmlFor="online_slug">
              Link address
            </label>
            <Form.Item
              name="online_slug"
              style={{ marginBottom: 12 }}
              normalize={(value: string) => value?.toLowerCase().trimStart()}
              rules={[
                { required: true, message: "The online app needs an address." },
                {
                  pattern: onlineSlugPattern,
                  message: "Lowercase letters, numbers and dashes only.",
                },
                {
                  min: onlineSlugMinLength,
                  max: onlineSlugMaxLength,
                  message: `Between ${onlineSlugMinLength} and ${onlineSlugMaxLength} characters.`,
                },
                {
                  validator: (_, value: string) =>
                    value && isReservedOnlineSlug(value)
                      ? Promise.reject(
                          new Error(
                            `"${value}" is already used by another part of the app.`,
                          ),
                        )
                      : Promise.resolve(),
                },
              ]}
            >
              <Input
                id="online_slug"
                size="large"
                addonBefore={`${window.location.origin}/`}
                placeholder="order-online"
              />
            </Form.Item>

            <p className={panelHint} style={{ marginTop: 0, wordBreak: "break-all" }}>
              Customers go to <strong>{link}</strong>
            </p>

            <Button
              icon={<CopyOutlined />}
              onClick={() => void copyLink()}
              style={{ marginTop: 10 }}
            >
              Copy link
            </Button>

            <p className={panelHint}>
              Changing this breaks any link you have already handed out or
              printed, so pick one you can live with.
            </p>
          </div>
        </section>

        <section className={panel}>
          <div className={panelHead}>
            <h2 className={panelTitle}>Contact</h2>
            <p className={panelHint}>
              Shown on the online checkout so a customer can call you before
              they pay. Leave it empty to show nothing.
            </p>
          </div>

          <div>
            <label className={fieldLabel} htmlFor="shop_contact_phone">
              Shop phone number
            </label>
            <Form.Item name="shop_contact_phone" style={{ marginBottom: 0 }}>
              <Input
                id="shop_contact_phone"
                size="large"
                maxLength={40}
                placeholder="e.g. 0917 123 4567"
              />
            </Form.Item>
          </div>
        </section>

        <div className={footer}>
          <Button type="primary" htmlType="submit" size="large" loading={isSaving}>
            Save shop settings
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default ShopSettingsForm;
