import { Tabs } from "antd";
import PaymentSettingsForm from "../../components/admin/settings/PaymentSettingsForm";
import ShopSettingsForm from "../../components/admin/settings/ShopSettingsForm";
import UserTable from "../../components/admin/users/UserTable";
import { UserRoleEnum } from "../../enums/role.enum";
import { useSessionStore } from "../../store/common/session.store";

/// Everything about the shop that is not the menu. Tab panels stay mounted, as
/// on the masterfile screen, so switching tabs does not tear down the query
/// observers behind each form.
///
/// Users is the one tab an admin does not get. The tab is hidden here and the
/// RPCs behind it check is_superadmin() themselves (0007), so hiding it is a
/// courtesy rather than the control — an admin who forces the tab open would
/// still be refused by the database.
const SettingsView = () => {
  const role = useSessionStore((s) => s.profile?.role);
  const isSuperAdmin = role === UserRoleEnum.SuperAdmin;

  return (
    <Tabs
      defaultActiveKey="shop"
      items={[
        { key: "shop", label: "Shop", children: <ShopSettingsForm /> },
        { key: "payment", label: "Payment", children: <PaymentSettingsForm /> },
        ...(isSuperAdmin
          ? [{ key: "users", label: "Users", children: <UserTable /> }]
          : []),
      ]}
    />
  );
};

export default SettingsView;
