import {
  CloudDownloadOutlined,
  CoffeeOutlined,
  HistoryOutlined,
  SettingOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import type { IRoute } from "../models/common/route.model";
import { UserRoleEnum } from "../enums/role.enum";
import MasterfileView from "../pages/Admin/MasterfileView";
import OrderHistoryView from "../pages/Admin/OrderHistoryView";
import OnlineOrdersView from "../pages/Admin/OnlineOrdersView";
import OrderQueueView from "../pages/Admin/OrderQueueView";
import SettingsView from "../pages/Admin/SettingsView";

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
    key: "online",
    path: "online",
    label: "Online Orders",
    description: "Paid online, waiting on your approval",
    icon: <CloudDownloadOutlined />,
    Component: OnlineOrdersView,
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
    key: "settings",
    path: "settings",
    label: "Settings",
    description: "Online link, trading hours, payment details and accounts",
    icon: <SettingOutlined />,
    // The shop's own money details and trading hours are the shop's call, so
    // an admin gets this screen. The Users tab inside it is still the
    // superadmin's alone — see SettingsView.
    role: [UserRoleEnum.SuperAdmin, UserRoleEnum.Admin],
    Component: SettingsView,
  },
];
