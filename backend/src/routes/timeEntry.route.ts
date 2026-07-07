import { Router } from "express";
import {
  startTimerController,
  stopTimerController,
  getActiveTimerController,
  logManualEntryController,
  getMyTimesheetController,
  getProjectTimesheetController,
  getWorkspaceTimesheetController,
  getTimesheetAnalyticsController,
  updateTimeEntryController,
  deleteTimeEntryController,
} from "../controllers/timeEntry.controller";

const timesheetRoutes = Router();

// Timer controls
timesheetRoutes.post(
  "/workspace/:workspaceId/timer/start",
  startTimerController
);
timesheetRoutes.post(
  "/workspace/:workspaceId/timer/:entryId/stop",
  stopTimerController
);
timesheetRoutes.get(
  "/workspace/:workspaceId/timer/active",
  getActiveTimerController
);

// Log manual time
timesheetRoutes.post("/workspace/:workspaceId/log", logManualEntryController);

// Read timesheets
timesheetRoutes.get("/workspace/:workspaceId/my", getMyTimesheetController);
timesheetRoutes.get(
  "/workspace/:workspaceId/project/:projectId",
  getProjectTimesheetController
);
timesheetRoutes.get(
  "/workspace/:workspaceId/all",
  getWorkspaceTimesheetController
);

// Analytics
timesheetRoutes.get(
  "/workspace/:workspaceId/analytics",
  getTimesheetAnalyticsController
);

// CRUD on individual entries
timesheetRoutes.put(
  "/workspace/:workspaceId/entry/:entryId",
  updateTimeEntryController
);
timesheetRoutes.delete(
  "/workspace/:workspaceId/entry/:entryId",
  deleteTimeEntryController
);

export default timesheetRoutes;
