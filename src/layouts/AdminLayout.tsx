import { LogoutOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import BrandMark from "../components/common/brand/BrandMark";
import AdminSiderUser from "../components/common/layout/AdminSiderUser";
import { useAdminAccountHook } from "../hook/layout/admin.layout.hook";
import { useQueueRealtimeHook } from "../hook/data/admin/queue.realtime.hook";
import { adminViewRoutes } from "../routes/admin.view.routes";
import {
  body,
  content,
  header,
  headerActions,
  headerSignOut,
  headerSub,
  headerTitle,
  liveChip,
  liveDot,
  liveDotOn,
  navBadge,
  navBadgeActive,
  navItem,
  navItemActive,
  shell,
  sider,
  siderBrand,
  tabBar,
  tabItem,
  tabItemActive,
} from "../styles/layout/admin.layout.css";
import { iconButton } from "../styles/layout/customer.layout.css";

const AdminLayout = () => {
  const location = useLocation();
  const { profile, signOut } = useAdminAccountHook();
  // Mounted here, once, so the chime and the realtime channel exist exactly
  // once across every admin screen.
  const { pendingCount, onlineCount, isLive } = useQueueRealtimeHook();

  // Masterfile is owner-only and Users is the superadmin's alone; the sider
  // must not advertise a route the screen behind it would turn away.
  const routes = adminViewRoutes.filter(
    (route) => !route.role || (profile && route.role.includes(profile.role)),
  );

  const active = routes.find((route) => location.pathname.endsWith(route.path ?? ""));

  // Two counts, two badges, from the one subscription mounted above.
  const badgeFor = (key: string | undefined) => {
    if (key === "queue") return pendingCount > 0 ? pendingCount : null;
    if (key === "online") return onlineCount > 0 ? onlineCount : null;
    return null;
  };

  return (
    <div className={shell}>
      <nav className={sider}>
        <div className={siderBrand}>
          <BrandMark tone="light" />
        </div>

        {routes.map((route) => (
          <NavLink
            key={route.key}
            to={`/admin/${route.path}`}
            className={({ isActive }) =>
              isActive ? `${navItem} ${navItemActive}` : navItem
            }
          >
            {({ isActive }) => (
              <>
                {route.icon}
                {route.label}
                {badgeFor(route.key) ? (
                  <span className={isActive ? `${navBadge} ${navBadgeActive}` : navBadge}>
                    {badgeFor(route.key)}
                  </span>
                ) : null}
              </>
            )}
          </NavLink>
        ))}

        <AdminSiderUser />
      </nav>

      <div className={body}>
        <header className={header}>
          <div>
            <h1 className={headerTitle}>{active?.label ?? "Admin"}</h1>
            <p className={headerSub}>{active?.description}</p>
          </div>

          <div className={headerActions}>
            <Tooltip
              title={
                isLive
                  ? "New orders arrive automatically"
                  : "Reconnecting — the board may lag"
              }
            >
              <span className={liveChip}>
                <span className={isLive ? `${liveDot} ${liveDotOn}` : liveDot} />
                {isLive ? "Live" : "Offline"}
              </span>
            </Tooltip>

            {/* Phones only — the sider that carries the account menu is hidden
                there, and sign-out cannot be. */}
            <Tooltip title="Sign out">
              <button
                type="button"
                className={`${iconButton} ${headerSignOut}`}
                onClick={() => void signOut()}
                aria-label="Sign out"
              >
                <LogoutOutlined />
              </button>
            </Tooltip>
          </div>
        </header>

        <main className={content}>
          <Outlet />
        </main>
      </div>

      <nav className={tabBar}>
        {routes.map((route) => (
          <NavLink
            key={route.key}
            to={`/admin/${route.path}`}
            className={({ isActive }) =>
              isActive ? `${tabItem} ${tabItemActive}` : tabItem
            }
          >
            {route.icon}
            {route.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AdminLayout;
