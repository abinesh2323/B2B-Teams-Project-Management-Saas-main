import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteTimeEntryMutationFn,
  getActiveTimerQueryFn,
  getMyTimesheetQueryFn,
  getProjectTimesheetQueryFn,
  getTimesheetAnalyticsQueryFn,
  getWorkspaceTimesheetQueryFn,
  logManualEntryMutationFn,
  startTimerMutationFn,
  stopTimerMutationFn,
  updateTimeEntryMutationFn,
} from "@/lib/timesheet-api";
import {
  ManualEntryPayloadType,
  StartTimerPayloadType,
  StopTimerPayloadType,
  TimesheetFilterType,
  UpdateEntryPayloadType,
} from "@/types/timeEntry.type";

// ─── Active Timer ──────────────────────────────────────────────────────────────
export const useActiveTimer = (workspaceId: string) => {
  return useQuery({
    queryKey: ["activeTimer", workspaceId],
    queryFn: () => getActiveTimerQueryFn({ workspaceId }),
    enabled: !!workspaceId,
    refetchInterval: 5000, // poll every 5 seconds to keep timer info fresh
    staleTime: 0,
  });
};

// ─── Start Timer ──────────────────────────────────────────────────────────────
export const useStartTimer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StartTimerPayloadType) =>
      startTimerMutationFn(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["activeTimer", variables.workspaceId],
      });
    },
  });
};

// ─── Stop Timer ───────────────────────────────────────────────────────────────
export const useStopTimer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StopTimerPayloadType) => stopTimerMutationFn(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["activeTimer", variables.workspaceId],
      });
      queryClient.invalidateQueries({ queryKey: ["myTimesheet"] });
      queryClient.invalidateQueries({ queryKey: ["workspaceTimesheet"] });
      queryClient.invalidateQueries({ queryKey: ["timesheetAnalytics"] });
    },
  });
};

// ─── Manual Entry ─────────────────────────────────────────────────────────────
export const useLogManualEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ManualEntryPayloadType) =>
      logManualEntryMutationFn(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTimesheet"] });
      queryClient.invalidateQueries({ queryKey: ["workspaceTimesheet"] });
      queryClient.invalidateQueries({ queryKey: ["timesheetAnalytics"] });
    },
  });
};

// ─── My Timesheet ─────────────────────────────────────────────────────────────
export const useMyTimesheet = (filters: TimesheetFilterType) => {
  return useQuery({
    queryKey: [
      "myTimesheet",
      filters.workspaceId,
      filters.startDate,
      filters.endDate,
      filters.projectId,
      filters.pageNumber,
      filters.pageSize,
    ],
    queryFn: () => getMyTimesheetQueryFn(filters),
    enabled: !!filters.workspaceId,
    staleTime: 30_000,
  });
};

// ─── Project Timesheet ────────────────────────────────────────────────────────
export const useProjectTimesheet = (
  filters: TimesheetFilterType & { projectId: string }
) => {
  return useQuery({
    queryKey: [
      "projectTimesheet",
      filters.workspaceId,
      filters.projectId,
      filters.userId,
      filters.startDate,
      filters.endDate,
      filters.pageNumber,
    ],
    queryFn: () => getProjectTimesheetQueryFn(filters),
    enabled: !!filters.workspaceId && !!filters.projectId,
    staleTime: 30_000,
  });
};

// ─── Workspace Timesheet ──────────────────────────────────────────────────────
export const useWorkspaceTimesheet = (filters: TimesheetFilterType) => {
  return useQuery({
    queryKey: [
      "workspaceTimesheet",
      filters.workspaceId,
      filters.projectId,
      filters.userId,
      filters.startDate,
      filters.endDate,
      filters.pageNumber,
    ],
    queryFn: () => getWorkspaceTimesheetQueryFn(filters),
    enabled: !!filters.workspaceId,
    staleTime: 30_000,
  });
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const useTimesheetAnalytics = (
  workspaceId: string,
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ["timesheetAnalytics", workspaceId, startDate, endDate],
    queryFn: () => getTimesheetAnalyticsQueryFn({ workspaceId, startDate, endDate }),
    enabled: !!workspaceId,
    staleTime: 60_000,
  });
};

// ─── Update Entry ─────────────────────────────────────────────────────────────
export const useUpdateTimeEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateEntryPayloadType) =>
      updateTimeEntryMutationFn(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTimesheet"] });
      queryClient.invalidateQueries({ queryKey: ["workspaceTimesheet"] });
    },
  });
};

// ─── Delete Entry ─────────────────────────────────────────────────────────────
export const useDeleteTimeEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { workspaceId: string; entryId: string }) =>
      deleteTimeEntryMutationFn(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTimesheet"] });
      queryClient.invalidateQueries({ queryKey: ["workspaceTimesheet"] });
      queryClient.invalidateQueries({ queryKey: ["timesheetAnalytics"] });
    },
  });
};
