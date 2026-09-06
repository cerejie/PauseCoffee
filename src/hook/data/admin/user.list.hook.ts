import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import { useCallback, useMemo } from "react";
import { AccessStatusEnum } from "../../../enums/access.status.enum";
import { UserRoleEnum } from "../../../enums/role.enum";
import { adminUsersQueryKey } from "../../../keys/query.keys";
import type { IUserAccount } from "../../../models/data/user/user.response";
import { userServices } from "../../../services/data/user/user.services";
import { useSessionStore } from "../../../store/common/session.store";
import { useUserStore } from "../../../store/data/user/user.store";
import { supabaseError } from "../../../utils/supabase.utils";

/// Who gets into the admin app. Sign-ups arrive pending and can do nothing
/// until this screen approves them; revoking puts an account back out without
/// destroying the record of it, and deleting removes the auth user for good.
///
/// Every rule here is also enforced in SQL — these guards are what keeps the
/// table from offering a button that can only fail.
export const useUserListHook = () => {
  const queryClient = useQueryClient();
  const { notification, modal: confirm } = App.useApp();
  const currentUserId = useSessionStore((s) => s.profile?.id);

  const search = useUserStore((s) => s.userSearch);
  const setSearch = useUserStore((s) => s.setUserSearch);
  const status = useUserStore((s) => s.userStatus);
  const setStatus = useUserStore((s) => s.setUserStatus);

  const query = useQuery({
    queryKey: [adminUsersQueryKey],
    queryFn: () => userServices.getUsers(),
  });

  const pendingCount = useMemo(
    () =>
      (query.data ?? []).filter((user) => user.status === AccessStatusEnum.Pending)
        .length,
    [query.data],
  );

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return (query.data ?? [])
      .filter((user) => !status || user.status === status)
      .filter(
        (user) =>
          !needle ||
          user.full_name.toLowerCase().includes(needle) ||
          (user.email ?? "").toLowerCase().includes(needle),
      )
      // Anything waiting on a decision floats up — that is the only reason to
      // open this screen.
      .sort((a, b) => {
        const weight = (user: IUserAccount) =>
          user.status === AccessStatusEnum.Pending ? 0 : 1;
        return weight(a) - weight(b);
      });
  }, [query.data, search, status]);

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: [adminUsersQueryKey] });
  }, [queryClient]);

  const statusMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: AccessStatusEnum }) =>
      userServices.setAccessStatus(id, next),

    onSuccess: invalidate,
    onError: (error) => {
      notification.error({
        message: "Couldn't update that account",
        description: supabaseError(error),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userServices.deleteUser(id),

    onSuccess: invalidate,
    onError: (error) => {
      notification.error({
        message: "Couldn't delete that account",
        description: supabaseError(error),
      });
    },
  });

  const nameOf = (user: IUserAccount) => user.full_name || user.email || "this account";

  const approve = useCallback(
    (user: IUserAccount) => {
      confirm.confirm({
        title: `Let ${nameOf(user)} in?`,
        content:
          "They get the full admin app — the queue, order history and the menu masterfile. Account management stays yours.",
        okText: "Approve",
        cancelText: "Not yet",
        centered: true,
        onOk: () =>
          statusMutation.mutateAsync({ id: user.id, next: AccessStatusEnum.Approved }),
      });
    },
    [confirm, statusMutation],
  );

  const revoke = useCallback(
    (user: IUserAccount) => {
      const declining = user.status === AccessStatusEnum.Pending;

      confirm.confirm({
        title: declining
          ? `Decline ${nameOf(user)}?`
          : `Revoke ${nameOf(user)}'s access?`,
        content: declining
          ? "Their request is turned down. The account stays listed, so you can still approve it later."
          : "They're signed out of the admin app on their next request. Nothing they've already done is undone.",
        okText: declining ? "Decline" : "Revoke",
        cancelText: "Cancel",
        okButtonProps: { danger: true },
        centered: true,
        onOk: () =>
          statusMutation.mutateAsync({ id: user.id, next: AccessStatusEnum.Revoked }),
      });
    },
    [confirm, statusMutation],
  );

  const remove = useCallback(
    (user: IUserAccount) => {
      confirm.confirm({
        title: `Delete ${nameOf(user)}?`,
        content:
          "The login is erased for good and this row disappears with it. Revoke instead if you only need to shut them out.",
        okText: "Delete for good",
        cancelText: "Cancel",
        okButtonProps: { danger: true },
        centered: true,
        onOk: () => deleteMutation.mutateAsync(user.id),
      });
    },
    [confirm, deleteMutation],
  );

  /// Your own row, and any other superadmin's, is read-only here — the same two
  /// rules set_access_status() and delete_user() enforce in the database.
  const canManage = useCallback(
    (user: IUserAccount) =>
      user.id !== currentUserId && user.role !== UserRoleEnum.SuperAdmin,
    [currentUserId],
  );

  return {
    rows,
    pendingCount,
    search,
    setSearch,
    status,
    setStatus,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
    isSaving: statusMutation.isPending || deleteMutation.isPending,
    canManage,
    approve,
    revoke,
    remove,
  };
};
