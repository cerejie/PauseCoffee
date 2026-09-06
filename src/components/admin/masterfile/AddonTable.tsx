import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Tag,
  Tooltip,
  type TableProps,
} from "antd";
import { useMemo } from "react";
import CardTable from "../../common/table/CardTable";
import FormModal from "../../common/modal/FormModal";
import RowActions from "../../common/table/cells/RowActions";
import { useAddonListHook } from "../../../hook/data/admin/addon.list.hook";
import type { IAddon } from "../../../models/data/menu/menu.response";
import { formatPeso } from "../../../utils/formatter.utils";
import {
  panel,
  toolbar,
  toolbarControl,
} from "../../../styles/layout/admin.layout.css";

type AddonRow = IAddon & { categoryNames: string[] };

const AddonTable = () => {
  const {
    rows,
    remove,
    removingId,
    categoryOptions,
    isLoading,
    isFetching,
    refetch,
    form,
    visible,
    isEditing,
    isSaving,
    openForm,
    close,
    onSubmit,
  } = useAddonListHook();

  const columns = useMemo<TableProps<AddonRow>["columns"]>(
    () => [
      { title: "Add-on", dataIndex: "name", key: "name" },
      {
        title: "Price",
        dataIndex: "price",
        key: "price",
        render: (_value, record) => (
          <span style={{ fontWeight: 700 }}>+{formatPeso(record.price)}</span>
        ),
      },
      {
        title: "Offered on",
        key: "categories",
        render: (_value, record) =>
          record.categoryNames.length ? (
            <span style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {record.categoryNames.map((name) => (
                <Tag key={name}>{name}</Tag>
              ))}
            </span>
          ) : (
            "— nothing yet"
          ),
      },
      {
        title: "Active",
        dataIndex: "is_active",
        key: "is_active",
        align: "center",
        render: (_value, record) => (
          <Switch size="small" checked={record.is_active} disabled />
        ),
      },
      {
        title: "",
        key: "actions",
        align: "right",
        render: (_value, record) => (
          <RowActions
            label={record.name}
            onEdit={() => openForm(record)}
            onDelete={() => remove(record)}
            deleting={removingId === record.id}
          />
        ),
      },
    ],
    [openForm, remove, removingId],
  );

  return (
    <div className={panel}>
      <div className={toolbar}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openForm()}>
          New add-on
        </Button>
        <div className={toolbarControl}>
          <Tooltip title="Refresh">
            <Button
              icon={<ReloadOutlined />}
              loading={isFetching}
              onClick={() => void refetch()}
            />
          </Tooltip>
        </div>
      </div>

      <CardTable<AddonRow>
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={rows}
        pagination={false}
      />

      <FormModal
        open={visible}
        title={isEditing ? "Edit add-on" : "New add-on"}
        subtitle="A paid extra the options drawer offers on the categories you pick."
        width={480}
        saving={isSaving}
        submitText={isEditing ? "Save changes" : "Add add-on"}
        submitIcon={isEditing ? undefined : <PlusOutlined />}
        onCancel={close}
        onSubmit={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={onSubmit} requiredMark={false}>
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Give it a name." }]}
          >
            <Input placeholder="Oatmilk" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: "How much?" }]}
          >
            <InputNumber min={0} max={9999} prefix="₱" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="category_ids"
            label="Offered on"
            extra="Only these categories show the add-on. Upsize belongs to matcha, seasalt cream to coffee."
          >
            <Select
              mode="multiple"
              allowClear
              placeholder="Pick the categories"
              options={categoryOptions}
            />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Active"
            valuePropName="checked"
            extra="Offered to customers."
            style={{ marginBottom: 0 }}
          >
            <Switch />
          </Form.Item>
        </Form>
      </FormModal>
    </div>
  );
};

export default AddonTable;
