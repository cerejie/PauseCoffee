import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Form, Input, Select, Switch, Tag, Tooltip, type TableProps } from "antd";
import { useMemo } from "react";
import CardTable from "../../common/table/CardTable";
import FormModal from "../../common/modal/FormModal";
import RowActions from "../../common/table/cells/RowActions";
import { menuGroupLabels, menuGroupOptions } from "../../../enums/menu.group.enum";
import { useSizeListHook } from "../../../hook/data/admin/size.list.hook";
import type { ISize } from "../../../models/data/menu/menu.response";
import {
  panel,
  toolbar,
  toolbarControl,
} from "../../../styles/layout/admin.layout.css";

type SizeRow = ISize & { usedBy: number };

/// The size masterfile. A size carries no price — the price is per item, set
/// when the item is priced, because a 16oz matcha and a 16oz latte differ.
const SizeTable = () => {
  const {
    rows,
    remove,
    removingId,
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
  } = useSizeListHook();

  const columns = useMemo<TableProps<SizeRow>["columns"]>(
    () => [
      { title: "Name", dataIndex: "name", key: "name" },
      {
        title: "Menu",
        dataIndex: "menu_group",
        key: "menu_group",
        render: (_value, record) => (
          <Tag>{record.menu_group ? menuGroupLabels[record.menu_group] : "Both"}</Tag>
        ),
      },
      {
        title: "Priced on",
        dataIndex: "usedBy",
        key: "usedBy",
        align: "center",
        render: (_value, record) => `${record.usedBy} item(s)`,
      },
      {
        title: "Offered",
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
          New size
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

      <CardTable<SizeRow>
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={rows}
        pagination={false}
      />

      <FormModal
        open={visible}
        title={isEditing ? "Edit size or type" : "New size or type"}
        subtitle="Drinks are priced per size, food per type. Both are shared across the menu; the price itself is set per item."
        width={460}
        saving={isSaving}
        submitText={isEditing ? "Save changes" : "Add it"}
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
            <Input placeholder="16oz, or 3pcs set" />
          </Form.Item>

          <Form.Item
            name="menu_group"
            label="Menu"
            extra="Pin it to one menu, or leave empty to offer it on both."
          >
            <Select allowClear placeholder="Both" options={menuGroupOptions} />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Offered"
            valuePropName="checked"
            extra="Offered when pricing new items."
            style={{ marginBottom: 0 }}
          >
            <Switch />
          </Form.Item>
        </Form>
      </FormModal>
    </div>
  );
};

export default SizeTable;
