import { PlusOutlined } from "@ant-design/icons";
import { Col, ColorPicker, Form, Input, Row, Select, Switch } from "antd";
import { menuGroupOptions } from "../../../enums/menu.group.enum";
import { useCategoryFormHook } from "../../../hook/data/admin/category.form.hook";
import FormModal from "../../common/modal/FormModal";
import {
  labelHint,
  section,
  sectionHead,
  sectionHint,
  sectionTitle,
} from "../../../styles/admin/masterfile.modal.css";

/// Create/update a category. The temperature and sweetness switches are what
/// the customer's options drawer reads, so they belong to the category rather
/// than being repeated on every product under it — which is why they sit in
/// their own ruled section rather than among the category's own details.
const CategoryFormModal = () => {
  const { form, visible, isEditing, isSaving, close, onSubmit } = useCategoryFormHook();

  return (
    <FormModal
      open={visible}
      title={isEditing ? "Edit category" : "New category"}
      subtitle={
        isEditing
          ? "Update the category details below."
          : "Group items under a heading on the customer menu."
      }
      width={600}
      saving={isSaving}
      submitText={isEditing ? "Save changes" : "Add category"}
      submitIcon={isEditing ? undefined : <PlusOutlined />}
      onCancel={close}
      onSubmit={() => form.submit()}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit} requiredMark={false}>
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>

        <Row gutter={16}>
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

        <Form.Item
          name="tagline"
          label={
            <>
              Tagline&nbsp;<span className={labelHint}>(optional)</span>
            </>
          }
          extra="Sits under the section heading on the menu."
        >
          <Input maxLength={80} placeholder="Cold, creamy, no espresso" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="accent_color"
              label="Accent"
              getValueFromEvent={(color) => color.toHexString()}
              extra="Tints this category everywhere it appears."
            >
              <ColorPicker format="hex" showText />
            </Form.Item>
          </Col>
          <Col span={12}>
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
            <h3 className={sectionTitle}>Customer options</h3>
            <span className={sectionHint}>
              What the options drawer asks for items in here.
            </span>
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="has_temperature"
                label="Ask hot or iced"
                valuePropName="checked"
                style={{ marginBottom: 0 }}
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="has_sweetness"
                label="Ask sweetness"
                valuePropName="checked"
                style={{ marginBottom: 0 }}
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </div>
      </Form>
    </FormModal>
  );
};

export default CategoryFormModal;
