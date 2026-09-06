import { LockOutlined } from "@ant-design/icons";
import UserTable from "../../components/admin/users/UserTable";
import EmptyState from "../../components/common/state/EmptyState";
import { UserRoleEnum } from "../../enums/role.enum";
import { useSessionStore } from "../../store/common/session.store";

/// Account management, and the one screen an admin does not get. The sider
/// already hides it, but the router registers every admin route regardless of
/// role, so a hand-typed /admin/users is turned away here rather than left to
/// render a table whose every button the database would refuse.
const UsersView = () => {
  const role = useSessionStore((s) => s.profile?.role);

  if (role !== UserRoleEnum.SuperAdmin) {
    return (
      <EmptyState
        icon={<LockOutlined />}
        title="Not your screen"
        description="Accounts are managed by the superadmin. Everything else in the app is yours."
      />
    );
  }

  return <UserTable />;
};

export default UsersView;
