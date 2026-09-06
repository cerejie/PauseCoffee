import { DownOutlined, LogoutOutlined } from "@ant-design/icons";
import { Button, Dropdown, type MenuProps } from "antd";
import { useAdminAccountHook } from "../../../hook/layout/admin.layout.hook";
import {
  siderAvatar,
  siderFooter,
  siderUser,
  siderUserCaret,
  siderUserMenu,
  siderUserMeta,
  siderUserName,
  siderUserRole,
} from "../../../styles/layout/admin.layout.css";

/// The signed-in account at the foot of the sider, and the way out of the app.
const AdminSiderUser = () => {
  const { displayName, roleLabel, initial, signOut } = useAdminAccountHook();

  const menu: MenuProps = {
    items: [
      { key: "logout", icon: <LogoutOutlined />, label: "Sign out", danger: true },
    ],
    onClick: ({ key }) => {
      if (key === "logout") void signOut();
    },
  };

  return (
    <div className={siderFooter}>
      <Dropdown
        menu={menu}
        trigger={["click"]}
        placement="topLeft"
        rootClassName={siderUserMenu}
      >
        <Button type="text" className={siderUser}>
          <span className={siderAvatar}>{initial}</span>
          <span className={siderUserMeta}>
            <span className={siderUserName}>{displayName}</span>
            <span className={siderUserRole}>{roleLabel}</span>
          </span>
          <DownOutlined className={siderUserCaret} />
        </Button>
      </Dropdown>
    </div>
  );
};

export default AdminSiderUser;
