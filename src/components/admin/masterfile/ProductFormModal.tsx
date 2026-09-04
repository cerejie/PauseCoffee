import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, InputNumber, Modal, Row, Select, Switch } from "antd";
import { menuGroupOptions } from "../../../enums/menu.group.enum";
import { useProductFormHook } from "../../../hook/data/admin/product.form.hook";

/// Create/update an item and its price tiers. Group narrows the category and
/// the size list; sizes are a Form.List because a House Blend has two tiers and
/// a pastry has one — the shape is per item, the vocabulary is the masterfile.
const ProductFormModal = () => {
  const {
    form,
    visible,
    isEditing,
    isSaving,
    categoryOptions,
    sizeOptions,
    onGroupChange,
    close,
    onSubmit,
  } = useProductFormHook();

  return (
    <Modal
      open={visible}
      onCancel={close}
      title={isEditing ? "Edit item" : "New item"}
      centered
      width={640}
      destroyOnHidden
      okText={isEditing ? "Save changes" : "Add item"}
      confirmLoading={isSaving}
      onOk={() => form.submit()}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit} requiredMark={false}>
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name="menu_group"
              label="Menu"
              rules={[{ required: true, message: "Drinks or food?" }]}
            >
              <Select options={menuGroupOptions} onChange={onGroupChange} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="category_id"
              label="Category"
              rules={[{ required: true, message: "Pick a category." }]}
            >
              <Select
                placeholder={
                  categoryOptions.length ? "Choose one" : "No categories in this menu yet"
                }
                disabled={!categoryOptions.length}
                options={categoryOptions}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Give it a name." }]}
        >
          <Input placeholder="Spanish Latte" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea
            rows={2}
            maxLength={140}
            placeholder="Condensed milk, full-bodied espresso"
          />
        </Form.Item>

        <Row gutter={12}>
          <Col span={10}>
            <Form.Item name="badge" label="Badge">
              <Input placeholder="Bestseller" maxLength={20} />
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item name="sort_order" label="Order">
              <InputNumber min={1} max={999} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item name="is_active" label="On the menu" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Form.List
          name="sizes"
          rules={[
            {
              validator: async (_rule, sizes) => {
                if (!sizes?.length) throw new Error("An item needs at least one size.");
              },
            },
          ]}
        >
          {(fields, { add, remove }, { errors }) => (
            <>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>
                Sizes and prices
              </div>
              {fields.map((field) => (
                <Row gutter={8} key={field.key} align="middle" style={{ marginBottom: 8 }}>
                  <Col span={11}>
                    <Form.Item
                      name={[field.name, "size_id"]}
                      style={{ marginBottom: 0 }}
                      rules={[{ required: true, message: "Size?" }]}
                    >
                      <Select
                        placeholder={
                          sizeOptions.length ? "Pick a size" : "Add a size first"
                        }
                        disabled={!sizeOptions.length}
                        options={sizeOptions}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={10}>
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
                  </Col>
                  <Col span={3}>
                    <Button
                      icon={<DeleteOutlined />}
                      danger
                      type="text"
                      disabled={fields.length === 1}
                      onClick={() => remove(field.name)}
                      aria-label="Remove size"
                    />
                  </Col>
                </Row>
              ))}

              <Button
                icon={<PlusOutlined />}
                onClick={() => add({ size_id: "", label: "", price: 0, sort_order: fields.length + 1 })}
                block
              >
                Add a size
              </Button>
              <Form.ErrorList errors={errors} />
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default ProductFormModal;
