import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { roleGuard } from "../utils/roleGuard";
import { Permissions } from "../enums/role.enum";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { projectIdSchema } from "../validation/project.validation";
import {
  entryIdSchema,
  manualEntrySchema,
  startTimerSchema,
  stopTimerSchema,
  timesheetFilterSchema,
  updateEntrySchema,
} from "../validation/timeEntry.validation";
import {
  deleteTimeEntryService,
  getActiveTimerService,
  getMyTimesheetService,
  getProjectTimesheetService,
  getTimesheetAnalyticsService,
  getWorkspaceTimesheetService,
  logManualEntryService,
  startTimerService,
  stopTimerService,
  updateTimeEntryService,
} from "../services/timeEntry.service";

// ─── Start Timer ──────────────────────────────────────────────────────────────
export const startTimerController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const body = startTimerSchema.parse(req.body);
    const { entry } = await startTimerService(
      userId,
      workspaceId,
      body.taskId,
      body.projectId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Timer started successfully",
      entry,
    });
  }
);

// ─── Stop Timer ───────────────────────────────────────────────────────────────
export const stopTimerController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const entryId = entryIdSchema.parse(req.params.entryId);
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const body = stopTimerSchema.parse(req.body);
    const { entry } = await stopTimerService(
      userId,
      workspaceId,
      entryId,
      body.description
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Timer stopped successfully",
      entry,
    });
  }
);

// ─── Get Active Timer ─────────────────────────────────────────────────────────
export const getActiveTimerController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { activeTimer } = await getActiveTimerService(userId, workspaceId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Active timer fetched",
      activeTimer,
    });
  }
);

// ─── Log Manual Entry ─────────────────────────────────────────────────────────
export const logManualEntryController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const body = manualEntrySchema.parse(req.body);
    const { entry } = await logManualEntryService(userId, workspaceId, body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Time entry logged successfully",
      entry,
    });
  }
);

// ─── Get My Timesheet ─────────────────────────────────────────────────────────
export const getMyTimesheetController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { startDate, endDate, projectId, pageSize, pageNumber } =
      timesheetFilterSchema.parse(req.query);

    const result = await getMyTimesheetService(
      userId,
      workspaceId,
      { startDate, endDate, projectId },
      { pageSize, pageNumber }
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Timesheet fetched successfully",
      ...result,
    });
  }
);

// ─── Get Project Timesheet ────────────────────────────────────────────────────
export const getProjectTimesheetController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { startDate, endDate, userId: filterUserId, pageSize, pageNumber } =
      timesheetFilterSchema.parse(req.query);

    const result = await getProjectTimesheetService(
      workspaceId,
      projectId,
      { startDate, endDate, userId: filterUserId },
      { pageSize, pageNumber }
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Project timesheet fetched successfully",
      ...result,
    });
  }
);

// ─── Get Workspace Timesheet (Admin/Owner) ────────────────────────────────────
export const getWorkspaceTimesheetController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.MANAGE_WORKSPACE_SETTINGS]);

    const {
      startDate,
      endDate,
      projectId,
      userId: filterUserId,
      pageSize,
      pageNumber,
    } = timesheetFilterSchema.parse(req.query);

    const result = await getWorkspaceTimesheetService(
      workspaceId,
      { startDate, endDate, projectId, userId: filterUserId },
      { pageSize, pageNumber }
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Workspace timesheet fetched successfully",
      ...result,
    });
  }
);

// ─── Get Analytics ────────────────────────────────────────────────────────────
export const getTimesheetAnalyticsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { startDate, endDate } = timesheetFilterSchema.parse(req.query);

    const analytics = await getTimesheetAnalyticsService(workspaceId, {
      startDate,
      endDate,
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Analytics fetched successfully",
      analytics,
    });
  }
);

// ─── Update Entry ─────────────────────────────────────────────────────────────
export const updateTimeEntryController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const entryId = entryIdSchema.parse(req.params.entryId);
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const body = updateEntrySchema.parse(req.body);
    const { entry } = await updateTimeEntryService(
      userId,
      workspaceId,
      entryId,
      body
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Time entry updated successfully",
      entry,
    });
  }
);

// ─── Delete Entry ─────────────────────────────────────────────────────────────
export const deleteTimeEntryController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const entryId = entryIdSchema.parse(req.params.entryId);
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    await deleteTimeEntryService(userId, workspaceId, entryId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Time entry deleted successfully",
    });
  }
);
