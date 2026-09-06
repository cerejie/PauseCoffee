import { Col, ColorPicker, Form, Input, Modal, Row, Select, Switch } from "antd";
import { menuGroupOptions } from "../../../enums/menu.group.enum";
import { useCategoryFormHook } from "../../../hook/data/admin/category.form.hook";

/// Create/update a category. The temperature and sweetness switches are what
/// the customer's options drawer reads, so they belong to the category rather
/// than being repeated on every product under it.
const CategoryFormModal = () => {
  const { form, visible, isEditing, isSaving, close, onSubmit } = useCategoryFormHook();

  return (
    <Modal
      open={visible}
      onCancel={close}
      title={isEditing ? "Edit category" : "New category"}
      centered
      width={560}
      destroyOnHidden
      okText={isEditing ? "Save changes" : "Add category"}
      confirmLoading={isSaving}
      onOk={() => form.submit()}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit} requiredMark={false}>
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>

        <Row gutter={12}>
          <Col span={14}>
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: "Give it a name." }]}
            >
              <Input placeholder="Non-Coffee" />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item
              name="menu_group"
              label="Menu"
              rules={[{ required: true, message: "Drinks or food?" }]}
            >
              <Select options={menuGroupOptions} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="tagline" label="Tagline">
          <Input maxLength={80} placeholder="Cold, creamy, no espresso" />
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name="accent_color"
              label="Accent"
              getValueFromEvent={(color) => color.toHexString()}
            >
              <ColorPicker format="hex" showText />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="is_active" label="On the menu" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name="has_temperature"
              label="Ask hot or iced"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="has_sweetness" label="Ask sweetness" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CategoryFormModal;
