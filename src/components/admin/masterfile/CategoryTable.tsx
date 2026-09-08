import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Switch, Tag, Tooltip, type TableProps } from "antd";
import { useMemo } from "react";
import CardTable from "../../common/table/CardTable";
import RowActions from "../../common/table/cells/RowActions";
import { TwoLineCell } from "../../common/table/cells/TwoLineCell";
import { menuGroupLabels } from "../../../enums/menu.group.enum";
import { useCategoryListHook } from "../../../hook/data/admin/category.list.hook";
import type { ICategory } from "../../../models/data/menu/menu.response";
import {
  panel,
  toolbar,
  toolbarControl,
} from "../../../styles/layout/admin.layout.css";
import CategoryFormModal from "./CategoryFormModal";

type CategoryRow = ICategory & { productCount: number };

/// The level between drinks/food and an item. Everything the options drawer
/// offers a customer is decided here, which is why the switches are columns.
const CategoryTable = () => {
  const {
    rows,
    isLoading,
    isFetching,
    refetch,
    openForm,
    toggleActive,
    isToggling,
    remove,
    removingId,
  } = useCategoryListHook();

  const columns = useMemo<TableProps<CategoryRow>["columns"]>(
    () => [
      {
        title: "Category",
        dataIndex: "name",
        key: "name",
        render: (_value, record) => (
          <TwoLineCell
            top={
              <span style={{ color: record.accent_color, fontWeight: 700 }}>
                {record.name}
              </span>
            }
            bottom={record.tagline ?? record.slug}
          />
        ),
      },
      {
        title: "Menu",
        dataIndex: "menu_group",
        key: "menu_group",
        render: (_value, record) => <Tag>{menuGroupLabels[record.menu_group]}</Tag>,
      },
      {
        title: "Items",
        dataIndex: "productCount",
        key: "productCount",
        align: "center",
      },
      {
        title: "Options",
        key: "options",
        render: (_value, record) => (
          <span style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {record.has_sweetness ? <Tag>Sweetness</Tag> : "—"}
          </span>
        ),
      },
      {
        title: "On menu",
        dataIndex: "is_active",
        key: "is_active",
        align: "center",
        render: (_value, record) => (
          <Switch
            size="small"
            checked={record.is_active}
            loading={isToggling}
            onChange={() => toggleActive(record)}
          />
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
    [openForm, toggleActive, isToggling, remove, removingId],
  );

  return (
    <div className={panel}>
      <div className={toolbar}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openForm()}>
          New category
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

      <CardTable<CategoryRow>
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={rows}
        pagination={false}
      />

      <CategoryFormModal />
    </div>
  );
};

export default CategoryTable;
