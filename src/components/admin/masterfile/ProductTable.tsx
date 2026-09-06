import { PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Select, Switch, Tag, Tooltip, type TableProps } from "antd";
import { useMemo } from "react";
import CardTable from "../../common/table/CardTable";
import ProductImage from "../../common/media/ProductImage";
import RowActions from "../../common/table/cells/RowActions";
import { TwoLineCell } from "../../common/table/cells/TwoLineCell";
import { useProductListHook } from "../../../hook/data/admin/product.list.hook";
import {
  menuGroupLabels,
  menuGroupOptions,
  type MenuGroupEnum,
} from "../../../enums/menu.group.enum";
import type { IProduct } from "../../../models/data/menu/menu.response";
import { formatPeso } from "../../../utils/formatter.utils";
import { cardSizeChip, cardSizes } from "../../../styles/menu/menu.css";
import { mediaCell, mediaCellRow } from "../../../styles/common/media.css";
import {
  panel,
  toolbar,
  toolbarControl,
  toolbarSearch,
} from "../../../styles/layout/admin.layout.css";
import ProductFormModal from "./ProductFormModal";

type ProductRow = IProduct & {
  categoryName: string;
  categoryAccent?: string;
  menuGroup: MenuGroupEnum | null;
};

const onMenuOptions = [
  { value: true, label: "On the menu" },
  { value: false, label: "Hidden" },
];

const ProductTable = () => {
  const {
    rows,
    categoryOptions,
    search,
    setSearch,
    group,
    setGroup,
    categoryId,
    setCategoryId,
    onMenu,
    setOnMenu,
    isLoading,
    isFetching,
    refetch,
    openForm,
    toggleActive,
    isToggling,
    remove,
    removingId,
  } = useProductListHook();

  const columns = useMemo<TableProps<ProductRow>["columns"]>(
    () => [
      {
        title: "Item",
        dataIndex: "name",
        key: "name",
        render: (_value, record) => (
          <div className={mediaCellRow}>
            <ProductImage
              src={record.image_url}
              alt={record.name}
              className={mediaCell}
            />
            <TwoLineCell top={record.name} bottom={record.description ?? "—"} />
          </div>
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
        <div className={toolbarSearch}>
          <Input
            allowClear
            prefix={<SearchOutlined style={{ opacity: 0.45 }} />}
            placeholder="Search an item…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <Select
          allowClear
          placeholder="Any menu"
          style={{ minWidth: 140 }}
          options={menuGroupOptions}
          value={group}
          onChange={(value) => setGroup(value ?? null)}
        />

        <Select
          allowClear
          placeholder="Any category"
          style={{ minWidth: 170 }}
          options={categoryOptions}
          value={categoryId}
          onChange={(value) => setCategoryId(value ?? null)}
        />

        <Select
          allowClear
          placeholder="On menu"
          style={{ minWidth: 150 }}
          options={onMenuOptions}
          value={onMenu}
          onChange={(value) => setOnMenu(value ?? null)}
        />

        <div className={toolbarControl}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openForm()}>
            New item
          </Button>

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
