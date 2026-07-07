import API from "./axios-client";
import {
  ActiveTimerResponseType,
  ManualEntryPayloadType,
  StartTimerPayloadType,
  StopTimerPayloadType,
  TimesheetAnalyticsType,
  TimesheetFilterType,
  TimesheetResponseType,
  UpdateEntryPayloadType,
} from "@/types/timeEntry.type";

// ─── Timer ────────────────────────────────────────────────────────────────────

export const startTimerMutationFn = async ({
  workspaceId,
  data,
}: StartTimerPayloadType) => {
  const response = await API.post(
    `/timesheet/workspace/${workspaceId}/timer/start`,
    data
  );
  return response.data;
};

export const stopTimerMutationFn = async ({
  workspaceId,
  entryId,
  data,
}: StopTimerPayloadType) => {
  const response = await API.post(
    `/timesheet/workspace/${workspaceId}/timer/${entryId}/stop`,
    data
  );
  return response.data;
};

export const getActiveTimerQueryFn = async ({
  workspaceId,
}: {
  workspaceId: string;
}): Promise<ActiveTimerResponseType> => {
  const response = await API.get(
    `/timesheet/workspace/${workspaceId}/timer/active`
  );
  return response.data;
};

// ─── Manual Entry ─────────────────────────────────────────────────────────────

export const logManualEntryMutationFn = async ({
  workspaceId,
  data,
}: ManualEntryPayloadType) => {
  const response = await API.post(
    `/timesheet/workspace/${workspaceId}/log`,
    data
  );
  return response.data;
};

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getMyTimesheetQueryFn = async ({
  workspaceId,
  startDate,
  endDate,
  projectId,
  pageSize = 20,
  pageNumber = 1,
}: TimesheetFilterType): Promise<TimesheetResponseType> => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (projectId) params.append("projectId", projectId);
  params.append("pageSize", String(pageSize));
  params.append("pageNumber", String(pageNumber));

  const response = await API.get(
    `/timesheet/workspace/${workspaceId}/my?${params}`
  );
  return response.data;
};

export const getProjectTimesheetQueryFn = async ({
  workspaceId,
  projectId,
  userId,
  startDate,
  endDate,
  pageSize = 20,
  pageNumber = 1,
}: TimesheetFilterType & { projectId: string }): Promise<TimesheetResponseType> => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (userId) params.append("userId", userId);
  params.append("pageSize", String(pageSize));
  params.append("pageNumber", String(pageNumber));

  const response = await API.get(
    `/timesheet/workspace/${workspaceId}/project/${projectId}?${params}`
  );
  return response.data;
};

export const getWorkspaceTimesheetQueryFn = async ({
  workspaceId,
  startDate,
  endDate,
  projectId,
  userId,
  pageSize = 20,
  pageNumber = 1,
}: TimesheetFilterType): Promise<TimesheetResponseType> => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (projectId) params.append("projectId", projectId);
  if (userId) params.append("userId", userId);
  params.append("pageSize", String(pageSize));
  params.append("pageNumber", String(pageNumber));

  const response = await API.get(
    `/timesheet/workspace/${workspaceId}/all?${params}`
  );
  return response.data;
};

export const getTimesheetAnalyticsQueryFn = async ({
  workspaceId,
  startDate,
  endDate,
}: {
  workspaceId: string;
  startDate?: string;
  endDate?: string;
}): Promise<TimesheetAnalyticsType> => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const response = await API.get(
    `/timesheet/workspace/${workspaceId}/analytics?${params}`
  );
  return response.data;
};

// ─── Update / Delete ──────────────────────────────────────────────────────────

export const updateTimeEntryMutationFn = async ({
  workspaceId,
  entryId,
  data,
}: UpdateEntryPayloadType) => {
  const response = await API.put(
    `/timesheet/workspace/${workspaceId}/entry/${entryId}`,
    data
  );
  return response.data;
};

export const deleteTimeEntryMutationFn = async ({
  workspaceId,
  entryId,
}: {
  workspaceId: string;
  entryId: string;
}) => {
  const response = await API.delete(
    `/timesheet/workspace/${workspaceId}/entry/${entryId}`
  );
  return response.data;
};
