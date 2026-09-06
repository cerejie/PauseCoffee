import { AccessStatusEnum } from "../../../enums/access.status.enum";
import { create } from "../../common/reset.store";

type States = {
  /// Users screen filters. The list is a handful of rows, so both are applied
  /// client-side against one query rather than as a paged server request.
  userSearch: string;
  userStatus: AccessStatusEnum | null;
};

type Actions = {
  setUserSearch: (value: string) => void;
  setUserStatus: (value: AccessStatusEnum | null) => void;
};

export const useUserStore = create<States & Actions>((set) => ({
  userSearch: "",
  userStatus: null,
  setUserSearch: (userSearch) => set({ userSearch }),
  setUserStatus: (userStatus) => set({ userStatus }),
}));
