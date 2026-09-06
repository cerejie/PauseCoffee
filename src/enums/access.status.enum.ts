/// Where an admin account sits between signing up and being let in. Only
/// `Approved` satisfies the database's is_staff(), so it is the whole of what
/// authorises the admin app.
export enum AccessStatusEnum {
  Pending = "pending",
  Approved = "approved",
  Revoked = "revoked",
}

export const accessStatusLabel: Record<AccessStatusEnum, string> = {
  [AccessStatusEnum.Pending]: "Awaiting approval",
  [AccessStatusEnum.Approved]: "Active",
  [AccessStatusEnum.Revoked]: "Revoked",
};
