import {
  CoffeeOutlined,
  HistoryOutlined,
  TeamOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import type { IRoute } from "../models/common/route.model";
import { UserRoleEnum } from "../enums/role.enum";
import MasterfileView from "../pages/Admin/MasterfileView";
import OrderHistoryView from "../pages/Admin/OrderHistoryView";
import OrderQueueView from "../pages/Admin/OrderQueueView";
import UsersView from "../pages/Admin/UsersView";

/// Plain data — the sider, the mobile tab bar and the router all read this one
/// list, so a new screen is a single entry rather than three edits.
export const adminViewRoutes: IRoute[] = [
  {
    key: "queue",
    path: "queue",
    label: "Order Queue",
    description: "Live tickets as they come in",
    icon: <UnorderedListOutlined />,
    Component: OrderQueueView,
  },
  {
    key: "orders",
    path: "orders",
    label: "Orders",
    description: "Every order placed, searchable",
    icon: <HistoryOutlined />,
    Component: OrderHistoryView,
  },
  {
    key: "masterfile",
    path: "masterfile",
    label: "Masterfile",
    description: "Menu, categories, sizes and add-ons",
    icon: <CoffeeOutlined />,
    // Pricing is an owner decision, not a barista one.
    role: [UserRoleEnum.SuperAdmin, UserRoleEnum.Admin],
    Component: MasterfileView,
  },
  {
    key: "users",
    path: "users",
    label: "Users",
    description: "Approve, revoke and remove admin accounts",
    icon: <TeamOutlined />,
    // Who gets in is the developer's call, not the shop's — the only thing an
    // admin cannot reach.
    role: [UserRoleEnum.SuperAdmin],
    Component: UsersView,
  },
];
