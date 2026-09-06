export enum UserRoleEnum {
  /// The developer. The only role that can approve, revoke or delete accounts.
  SuperAdmin = "superadmin",
  /// The shop. Runs the whole app, has no say over who else gets in.
  Admin = "admin",
  /// Legacy — nothing grants it any more. Kept because the database enum still
  /// carries the value.
  Staff = "staff",
}

export const userRoleLabel: Record<UserRoleEnum, string> = {
  [UserRoleEnum.SuperAdmin]: "Superadmin",
  [UserRoleEnum.Admin]: "Admin",
  [UserRoleEnum.Staff]: "Staff",
};
