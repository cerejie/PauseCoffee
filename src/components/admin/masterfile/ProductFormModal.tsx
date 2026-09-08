import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, InputNumber, Row, Select, Switch } from "antd";
import { MenuGroupEnum, menuPortionNoun } from "../../../enums/menu.group.enum";
import { serveTemperatureOptions } from "../../../enums/order.enum";
import { useProductFormHook } from "../../../hook/data/admin/product.form.hook";
import FormModal from "../../common/modal/FormModal";
import ProductImageUpload from "./ProductImageUpload";
import {
  addRowButton,
  labelHint,
  section,
  sectionHead,
  sectionHint,
  sectionTitle,
  sizeRow,
  sizeRowServed,
} from "../../../styles/admin/masterfile.modal.css";

/// Create/update an item and its price tiers. The category settles which menu
/// the item is on, and that decides what the price rows are called: a drink is
/// priced per size, food per type ("1pc", "3pcs set"). They are a Form.List
/// either way, because a House Blend has two tiers and a cookie has one.
///
/// Hot or iced is settled here too, per price row rather than per category — a
/// 16oz can be iced-only while the 12oz beside it goes both ways. Food rows
/// drop the field entirely; a cookie is never served hot by request.
const ProductFormModal = () => {
  const {
    form,
    visible,
    isEditing,
    isSaving,
    menuGroup,
    blankSize,
    categoryOptions,
    sizeOptions,
    onCategoryChange,
    trackUpload,
    close,
    onSubmit,
  } = useProductFormHook();

  const portion = menuPortionNoun[menuGroup] ?? menuPortionNoun[MenuGroupEnum.Drinks];
  const isDrink = menuGroup === MenuGroupEnum.Drinks;

  return (
    <FormModal
      open={visible}
      title={isEditing ? "Edit item" : "New item"}
      subtitle={
        isEditing
          ? "Update the item details below."
          : "Add a drink or a dish to the customer menu."
      }
      width={720}
      saving={isSaving}
      submitText={isEditing ? "Save changes" : "Add item"}
      submitIcon={isEditing ? undefined : <PlusOutlined />}
      onCancel={close}
      onSubmit={() => form.submit()}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit} requiredMark={false}>
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>

        {/* Carried, not asked for: the chosen category is what sets it. */}
        <Form.Item name="menu_group" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          name="category_id"
          label="Category"
          extra="Which menu the item appears on follows from this."
          rules={[{ required: true, message: "Pick a category." }]}
        >
          <Select
            placeholder={
              categoryOptions.length
                ? "Choose a category"
                : "Add a category on the Categories tab first"
            }
            options={categoryOptions}
            onChange={onCategoryChange}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <Row gutter={24}>
          <Col flex="200px">
            {/* Required: the customer menu leads with the picture, and an item
                without one is the odd tile out on the grid. */}
            <Form.Item
              name="image_path"
              label="Photo"
              rules={[{ required: true, message: "Every item needs a photo." }]}
            >
              <ProductImageUpload onUploaded={trackUpload} />
            </Form.Item>
          </Col>

          <Col flex="auto" style={{ minWidth: 0 }}>
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: "Give it a name." }]}
            >
              <Input placeholder="Spanish Latte" />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <Input.TextArea
                rows={4}
                maxLength={140}
                showCount
                placeholder="Condensed milk, full-bodied espresso"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={10}>
            <Form.Item
              name="badge"
              label={
                <>
                  Badge&nbsp;<span className={labelHint}>(optional)</span>
                </>
              }
            >
              <Input placeholder="Bestseller" maxLength={20} />
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item
              name="sort_order"
              label="Display order"
              extra="Lower numbers appear first."
            >
              <InputNumber min={1} max={999} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item
              name="is_active"
              label="On the menu"
              valuePropName="checked"
              extra="Visible to customers."
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <div className={section}>
          <div className={sectionHead}>
            <h3 className={sectionTitle}>{portion.many} &amp; prices</h3>
            <span className={sectionHint}>
              Set the available {portion.one}s
              {isDrink ? ", their prices and how they are served" : " and their prices"}.
            </span>
          </div>

          <Form.List
            name="sizes"
            rules={[
              {
                validator: async (_rule, sizes) => {
                  if (!sizes?.length)
                    throw new Error(`An item needs at least one ${portion.one}.`);
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map((field) => (
                  <div
                    className={isDrink ? `${sizeRow} ${sizeRowServed}` : sizeRow}
                    key={field.key}
                  >
                    <Form.Item
                      name={[field.name, "size_id"]}
                      style={{ marginBottom: 0 }}
                      rules={[{ required: true, message: "Which one?" }]}
                    >
                      <Select
                        placeholder={
                          sizeOptions.length
                            ? `Pick a ${portion.one}`
                            : `Add a ${portion.one} on the Sizes tab first`
                        }
                        options={sizeOptions}
                      />
                    </Form.Item>

                    <Form.Item
                      name={[field.name, "price"]}
                      style={{ marginBottom: 0 }}
                      rules={[{ required: true, message: "Price?" }]}
                    >
                      <InputNumber
                        min={0}
                        max={9999}
                        prefix="₱"
                        style={{ width: "100%" }}
                        placeholder="150"
                      />
                    </Form.Item>

                    {isDrink && (
                      <Form.Item
                        name={[field.name, "serve_temperature"]}
                        style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: "Served how?" }]}
                      >
                        <Select
                          placeholder="Served how?"
                          options={serveTemperatureOptions}
                        />
                      </Form.Item>
                    )}

                    <Button
                      icon={<DeleteOutlined />}
                      danger
                      disabled={fields.length === 1}
                      onClick={() => remove(field.name)}
                      aria-label={`Remove ${portion.one}`}
                    />
                  </div>
                ))}

                <Button
                  className={addRowButton}
                  icon={<PlusOutlined />}
                  onClick={() => add(blankSize(menuGroup, fields.length + 1))}
                  block
                >
                  Add a {portion.one}
                </Button>
                <Form.ErrorList errors={errors} />
              </>
            )}
          </Form.List>
        </div>
      </Form>
    </FormModal>
  );
};

export default ProductFormModal;
