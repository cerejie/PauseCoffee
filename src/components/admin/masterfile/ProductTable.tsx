import { EditOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Switch, Tag, Tooltip, type TableProps } from "antd";
import { useMemo } from "react";
import CardTable from "../../common/table/CardTable";
import { TwoLineCell } from "../../common/table/cells/TwoLineCell";
import { useProductListHook } from "../../../hook/data/admin/product.list.hook";
import {
  menuGroupLabels,
  type MenuGroupEnum,
} from "../../../enums/menu.group.enum";
import type { IProduct } from "../../../models/data/menu/menu.response";
import { formatPeso } from "../../../utils/formatter.utils";
import { cardSizeChip, cardSizes } from "../../../styles/menu/menu.css";
import {
  panel,
  toolbar,
  toolbarControl,
} from "../../../styles/layout/admin.layout.css";
import ProductFormModal from "./ProductFormModal";

type ProductRow = IProduct & {
  categoryName: string;
  categoryAccent?: string;
  menuGroup: MenuGroupEnum | null;
};

const ProductTable = () => {
  const {
    rows,
    isLoading,
    isFetching,
    refetch,
    openForm,
    toggleActive,
    isToggling,
  } = useProductListHook();

  const columns = useMemo<TableProps<ProductRow>["columns"]>(
    () => [
      {
        title: "Item",
        dataIndex: "name",
        key: "name",
        render: (_value, record) => (
          <TwoLineCell top={record.name} bottom={record.description ?? "—"} />
        ),
      },
      {
        title: "Menu",
        dataIndex: "menuGroup",
        key: "menuGroup",
        render: (_value, record) => (
          <Tag>{record.menuGroup ? menuGroupLabels[record.menuGroup] : "—"}</Tag>
        ),
      },
      {
        title: "Category",
        dataIndex: "categoryName",
        key: "categoryName",
        render: (_value, record) => (
          <span style={{ color: record.categoryAccent, fontWeight: 600 }}>
            {record.categoryName}
          </span>
        ),
      },
      {
        title: "Sizes",
        key: "sizes",
        render: (_value, record) => (
          <span className={cardSizes} style={{ marginTop: 0 }}>
            {record.product_sizes.map((size) => (
              <span key={size.id} className={cardSizeChip}>
                {size.label} · {formatPeso(size.price)}
              </span>
            ))}
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
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openForm(record)}
              aria-label={`Edit ${record.name}`}
            />
          </Tooltip>
        ),
      },
    ],
    [openForm, toggleActive, isToggling],
  );

  return (
    <div className={panel}>
      <div className={toolbar}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openForm()}>
          New item
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

      <CardTable<ProductRow>
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={rows}
        pagination={{ pageSize: 12, showTotal: (total) => `${total} items` }}
      />

      <ProductFormModal />
    </div>
  );
};

export default ProductTable;
