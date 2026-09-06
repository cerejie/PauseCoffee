import { Tabs } from "antd";
import AddonTable from "../../components/admin/masterfile/AddonTable";
import CategoryTable from "../../components/admin/masterfile/CategoryTable";
import ProductTable from "../../components/admin/masterfile/ProductTable";
import SizeTable from "../../components/admin/masterfile/SizeTable";

/// The masterfiles the rest of the app reads: what is sold, how it is grouped,
/// what sizes it comes in and what can be added to it. Tab panels stay mounted
/// (`destroyOnHidden` off by default) so switching tabs does not tear down the
/// query observers behind each table.
const MasterfileView = () => (
  <Tabs
    defaultActiveKey="menu"
    items={[
      { key: "menu", label: "Menu", children: <ProductTable /> },
      { key: "categories", label: "Categories", children: <CategoryTable /> },
      { key: "sizes", label: "Sizes & types", children: <SizeTable /> },
      { key: "addons", label: "Add-ons", children: <AddonTable /> },
    ]}
  />
);

export default MasterfileView;
