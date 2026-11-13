import { CheckCircleFilled, PauseCircleFilled, TagOutlined } from "@ant-design/icons";
import { Button, Form, InputNumber, Segmented, Switch } from "antd";
import { DiscountTypeEnum } from "../../../enums/discount.enum";
import { useDiscountSettingsHook } from "../../../hook/data/admin/settings.form.hook";
import { discountedPrice, discountLabel } from "../../../utils/discount.utils";
import { formatPeso } from "../../../utils/formatter.utils";
import BrandLoader from "../../common/loader/BrandLoader";
import {
  discountExample,
  discountExampleNew,
  discountExampleWas,
  divider,
  fieldLabel,
  footer,
  panel,
  panelHead,
  panelHint,
  panelTitle,
  stack,
  statusNote,
  statusNoteOpen,
  statusNoteShut,
  toggleCopy,
  toggleHint,
  toggleRow,
  toggleTitle,
} from "../../../styles/admin/settings.css";

/// A typical cup, used only to show the owner what their number does before
/// they save it.
const EXAMPLE_PRICE = 150;

const typeOptions = [
  { label: "Percent", value: DiscountTypeEnum.Percent },
  { label: "Amount", value: DiscountTypeEnum.Amount },
];

/// One shop-wide discount on every drink. The switch is the whole decision;
/// the unit and the number say how much. Customers see the old price struck
/// through, and place_order charges the new one (0021).
const DiscountSettingsForm = () => {
  const { form, isLoading, isSaving, onTypeChange, onSubmit } = useDiscountSettingsHook();

  // Watched so the example and the status line follow what is on screen,
  // not what was last saved.
  const enabled = Form.useWatch("discount_enabled", form);
  const type = Form.useWatch("discount_type", form) ?? DiscountTypeEnum.Percent;
  const value = Number(Form.useWatch("discount_value", form) ?? 0);

  const isPercent = type === DiscountTypeEnum.Percent;
  const preview = value > 0 ? { type, value } : null;
  const examplePrice = discountedPrice(EXAMPLE_PRICE, preview);

  if (isLoading) return <BrandLoader label="Loading discount" />;

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
      requiredMark={false}
      initialValues={{ discount_enabled: false, discount_type: DiscountTypeEnum.Percent }}
    >
      <div className={stack}>
        <section className={panel}>
          <div className={panelHead}>
            <h2 className={panelTitle}>Discount</h2>
            <p className={panelHint}>
              Takes the same amount off every drink on the menu, in store and
              online. Add-ons stay full price. Customers see the old price
              crossed out next to the new one.
            </p>
          </div>

          <div className={toggleRow}>
            <div className={toggleCopy}>
              <p className={toggleTitle}>Run a discount</p>
              <p className={toggleHint}>
                Switch it off when the promo ends — your numbers are kept for
                next time.
              </p>
            </div>
            <Form.Item
              name="discount_enabled"
              valuePropName="checked"
              style={{ marginBottom: 0 }}
            >
              <Switch aria-label="Run a discount" />
            </Form.Item>
          </div>

          {enabled && preview ? (
            <div className={`${statusNote} ${statusNoteOpen}`}>
              <CheckCircleFilled />
              Live — {discountLabel(preview)} every drink once you save.
            </div>
          ) : (
            <div className={`${statusNote} ${statusNoteShut}`}>
              <PauseCircleFilled />
              {enabled
                ? "Enter how much to take off before saving."
                : "Off. Customers see regular prices."}
            </div>
          )}

          <div className={divider} />

          <label className={fieldLabel} id="discount_type_label">
            Discount by
          </label>
          <Form.Item name="discount_type" style={{ marginBottom: 16 }}>
            <Segmented<DiscountTypeEnum>
              block
              size="large"
              options={typeOptions}
              disabled={!enabled}
              onChange={onTypeChange}
              aria-labelledby="discount_type_label"
            />
          </Form.Item>

          <label className={fieldLabel} htmlFor="discount_value">
            {isPercent ? "Percent off each drink" : "Pesos off each drink"}
          </label>
          <Form.Item
            name="discount_value"
            style={{ marginBottom: 8 }}
            dependencies={["discount_enabled", "discount_type"]}
            rules={[
              ({ getFieldValue }) => ({
                validator: (_, raw: number | null) => {
                  if (!getFieldValue("discount_enabled")) return Promise.resolve();
                  const amount = Number(raw ?? 0);
                  if (amount <= 0) {
                    return Promise.reject(new Error("Enter how much to take off."));
                  }
                  if (
                    getFieldValue("discount_type") === DiscountTypeEnum.Percent &&
                    amount > 100
                  ) {
                    return Promise.reject(new Error("A percent can't go past 100."));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber<number>
              id="discount_value"
              size="large"
              inputMode="decimal"
              disabled={!enabled}
              min={0}
              max={isPercent ? 100 : 9999}
              step={isPercent ? 5 : 10}
              precision={isPercent ? 0 : 2}
              prefix={isPercent ? undefined : "₱"}
              suffix={isPercent ? "%" : undefined}
              placeholder={isPercent ? "e.g. 10" : "e.g. 20"}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <p className={panelHint} style={{ marginTop: 0 }}>
            {isPercent
              ? "Whole numbers, up to 100."
              : "Taken off each cup. A drink never goes below ₱0."}
          </p>

          <div className={discountExample} aria-live="polite">
            <TagOutlined />
            <span>A {formatPeso(EXAMPLE_PRICE)} drink becomes</span>
            {preview ? (
              <>
                <s className={discountExampleWas}>{formatPeso(EXAMPLE_PRICE)}</s>
                <strong className={discountExampleNew}>{formatPeso(examplePrice)}</strong>
              </>
            ) : (
              <strong className={discountExampleNew}>{formatPeso(EXAMPLE_PRICE)}</strong>
            )}
          </div>
        </section>

        <div className={footer}>
          <Button type="primary" htmlType="submit" size="large" loading={isSaving}>
            Save discount
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default DiscountSettingsForm;
