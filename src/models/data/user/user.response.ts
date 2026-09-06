import type { AccessStatusEnum } from "../../../enums/access.status.enum";
import type { UserRoleEnum } from "../../../enums/role.enum";

/// One row of public.profiles as the Users screen reads it. `email` is
/// denormalised from auth.users by a trigger — the anon client cannot see the
/// auth schema itself.
export interface IUserAccount {
  id: string;
  email: string | null;
  full_name: string;
  role: UserRoleEnum;
  status: AccessStatusEnum;
  created_at: string;
}
