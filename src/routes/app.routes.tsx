import { Navigate, type RouteObject } from "react-router-dom";
import AdminGuard from "../components/common/guard/AdminGuard";
import { emailConfirmPath } from "../constants/auth.constants";
import AdminLayout from "../layouts/AdminLayout";
import CustomerLayout from "../layouts/CustomerLayout";
import AdminConfirmEmailView from "../pages/Admin/AdminConfirmEmailView";
import AdminLoginView from "../pages/Admin/AdminLoginView";
import CartView from "../pages/Customer/CartView";
import MenuView from "../pages/Customer/MenuView";
import NotFoundView from "../pages/NotFoundView";
import OrderTrackerView from "../pages/Customer/OrderTrackerView";
import { adminViewRoutes } from "./admin.view.routes";

export const appRoutes: RouteObject[] = [
  {
    path: "/",
    Component: CustomerLayout,
    children: [
      { index: true, Component: MenuView },
      { path: "cart", Component: CartView },
      { path: "order/:orderId", Component: OrderTrackerView },
    ],
  },
  {
    // Outside the guard on purpose — the login screen is where an unauthorised
    // visitor is sent, so it cannot itself require a session.
    path: "/admin/login",
    Component: AdminLoginView,
  },
  {
    // Outside the guard too: whoever follows the link out of their inbox has no
    // session, and the account it confirms is not approved yet either.
    path: emailConfirmPath,
    Component: AdminConfirmEmailView,
  },
  {
    path: "/admin",
    Component: AdminGuard,
    children: [
      {
        Component: AdminLayout,
        children: [
          { index: true, element: <Navigate to="/admin/queue" replace /> },
          ...adminViewRoutes.map((route) => ({
            path: route.path,
            Component: route.Component,
          })),
          // Account management moved into a tab on Settings. Kept as a
          // redirect because /admin/users is where anyone who used the app
          // before this change still has their bookmark.
          {
            path: "users",
            element: <Navigate to="/admin/settings" replace />,
          },
        ],
      },
    ],
  },
  { path: "*", Component: NotFoundView },
];
