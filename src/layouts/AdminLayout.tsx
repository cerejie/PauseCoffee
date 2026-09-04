import { LogoutOutlined } from "@ant-design/icons";
import { App, Tooltip } from "antd";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import BrandMark from "../components/common/brand/BrandMark";
import { UserRoleEnum } from "../enums/role.enum";
import { useQueueRealtimeHook } from "../hook/data/admin/queue.realtime.hook";
import { adminViewRoutes } from "../routes/admin.view.routes";
import { adminServices } from "../services/data/admin/admin.services";
import { resetAllStores } from "../store/common/reset.store";
import { useSessionStore } from "../store/common/session.store";
import { supabaseError } from "../utils/supabase.utils";
import {
  body,
  content,
  header,
  headerActions,
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
  siderAvatar,
  siderBrand,
  siderFooter,
  siderUser,
  siderUserName,
  siderUserRole,
  tabBar,
  tabItem,
  tabItemActive,
} from "../styles/layout/admin.layout.css";
import { iconButton } from "../styles/layout/customer.layout.css";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { notification } = App.useApp();
  const profile = useSessionStore((s) => s.profile);
  // Mounted here, once, so the chime and the realtime channel exist exactly
  // once across every admin screen.
  const { pendingCount, isLive } = useQueueRealtimeHook();

  // The Menu screen is owner-only; the sider must not advertise a route the
  // router would bounce anyway.
  const routes = adminViewRoutes.filter(
    (route) => !route.role || (profile && route.role.includes(profile.role)),
  );

  const active = routes.find((route) => location.pathname.endsWith(route.path ?? ""));

  const signOut = async () => {
    try {
      await adminServices.signOut();
      resetAllStores();
      navigate("/admin/login", { replace: true });
    } catch (error) {
      notification.error({
        message: "Couldn't sign out",
        description: supabaseError(error),
      });
    }
  };

  const badgeFor = (key: string | undefined) =>
    key === "queue" && pendingCount > 0 ? pendingCount : null;

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

        <div className={siderFooter}>
          <div className={siderUser}>
            <span className={siderAvatar}>
              {(profile?.full_name || "P").slice(0, 1).toUpperCase()}
            </span>
            <span style={{ minWidth: 0 }}>
              <span className={siderUserName}>{profile?.full_name || "Staff"}</span>
              <span className={siderUserRole}>
                {profile?.role ?? UserRoleEnum.Staff}
              </span>
            </span>
          </div>
        </div>
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

            <Tooltip title="Sign out">
              <button
                type="button"
                className={iconButton}
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
