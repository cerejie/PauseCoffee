import type { RouteObject } from "react-router-dom";
import type { UserRoleEnum } from "../../enums/role.enum";

export type IRoute = {
  key?: string;
  isNotNav?: boolean;
  icon?: React.ReactNode;
  label?: string;
  description?: string;
  children?: IRoute[];
  role?: UserRoleEnum[];
} & RouteObject;
