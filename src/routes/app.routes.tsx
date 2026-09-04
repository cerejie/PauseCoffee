import { Navigate, type RouteObject } from "react-router-dom";
import AdminGuard from "../components/common/guard/AdminGuard";
import AdminLayout from "../layouts/AdminLayout";
import CustomerLayout from "../layouts/CustomerLayout";
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
        ],
      },
    ],
  },
  { path: "*", Component: NotFoundView },
];
