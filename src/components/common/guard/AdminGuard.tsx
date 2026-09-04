import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSessionHook } from "../../../hook/account/session.hook";
import BrandLoader from "../loader/BrandLoader";

/// Gate for everything under /admin. It waits for the stored session to
/// rehydrate before deciding — bouncing on the first render would kick a
/// signed-in barista back to login every time the PWA cold-starts.
const AdminGuard = () => {
  const { ready, isStaff } = useSessionHook();
  const location = useLocation();

  if (!ready) return <BrandLoader label="Checking your access" fullscreen />;

  if (!isStaff) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default AdminGuard;
