import mongoose from "mongoose";
import TimeEntryModel from "../models/timeEntry.model";
import TaskModel from "../models/task.model";
import ProjectModel from "../models/project.model";
import { BadRequestException, NotFoundException } from "../utils/appError";

// ─── Start Timer ─────────────────────────────────────────────────────────────
export const startTimerService = async (
  userId: string,
  workspaceId: string,
  taskId: string,
  projectId: string
) => {
  // Verify task belongs to project and workspace
  const task = await TaskModel.findOne({
    _id: taskId,
    project: projectId,
    workspace: workspaceId,
  });
  if (!task) {
    throw new NotFoundException(
      "Task not found or does not belong to this project/workspace"
    );
  }

  // Prevent duplicate active timer for same user
  const existingActive = await TimeEntryModel.findOne({
    user: userId,
    workspace: workspaceId,
    endTime: null,
  });
  if (existingActive) {
    throw new BadRequestException(
      "You already have a running timer. Please stop it before starting a new one."
    );
  }

  const entry = await TimeEntryModel.create({
    task: taskId,
    project: projectId,
    workspace: workspaceId,
    user: userId,
    startTime: new Date(),
    endTime: null,
    duration: 0,
    isManual: false,
  });

  return { entry };
};

// ─── Stop Timer ──────────────────────────────────────────────────────────────
export const stopTimerService = async (
  userId: string,
  workspaceId: string,
  entryId: string,
  description?: string
) => {
  const entry = await TimeEntryModel.findOne({
    _id: entryId,
    user: userId,
    workspace: workspaceId,
    endTime: null,
  });

  if (!entry) {
    throw new NotFoundException("No active timer found with the given ID.");
  }

  const endTime = new Date();
  const duration = Math.floor(
    (endTime.getTime() - entry.startTime.getTime()) / 1000
  );

  entry.endTime = endTime;
  entry.duration = duration;
  entry.description = description || null;
  await entry.save();

  return { entry };
};

// ─── Log Manual Entry ─────────────────────────────────────────────────────────
export const logManualEntryService = async (
  userId: string,
  workspaceId: string,
  body: {
    taskId: string;
    projectId: string;
    startTime: string;
    endTime: string;
    description?: string;
  }
) => {
  const { taskId, projectId, startTime, endTime, description } = body;

  const task = await TaskModel.findOne({
    _id: taskId,
    project: projectId,
    workspace: workspaceId,
  });
  if (!task) {
    throw new NotFoundException(
      "Task not found or does not belong to this project/workspace"
    );
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (end <= start) {
    throw new BadRequestException("End time must be after start time.");
  }

  const duration = Math.floor((end.getTime() - start.getTime()) / 1000);

  const entry = await TimeEntryModel.create({
    task: taskId,
    project: projectId,
    workspace: workspaceId,
    user: userId,
    startTime: start,
    endTime: end,
    duration,
    description: description || null,
    isManual: true,
  });

  return { entry };
};

// ─── Get Active Timer for User ────────────────────────────────────────────────
export const getActiveTimerService = async (
  userId: string,
  workspaceId: string
) => {
  const entry = await TimeEntryModel.findOne({
    user: userId,
    workspace: workspaceId,
    endTime: null,
  })
    .populate("task", "_id title taskCode")
    .populate("project", "_id name emoji");

  return { activeTimer: entry };
};

// ─── Get My Timesheet ─────────────────────────────────────────────────────────
export const getMyTimesheetService = async (
  userId: string,
  workspaceId: string,
  filters: {
    startDate?: string;
    endDate?: string;
    projectId?: string;
  },
  pagination: { pageSize: number; pageNumber: number }
) => {
  const query: Record<string, any> = {
    user: userId,
    workspace: workspaceId,
    endTime: { $ne: null }, // only completed entries
  };

  if (filters.projectId) query.project = filters.projectId;

  if (filters.startDate || filters.endDate) {
    query.startTime = {};
    if (filters.startDate) query.startTime.$gte = new Date(filters.startDate);
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      query.startTime.$lte = end;
    }
  }

  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [entries, totalCount] = await Promise.all([
    TimeEntryModel.find(query)
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate("task", "_id title taskCode status priority")
      .populate("project", "_id name emoji"),
    TimeEntryModel.countDocuments(query),
  ]);

  const totalDuration = await TimeEntryModel.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: "$duration" } } },
  ]);

  return {
    entries,
    totalDuration: totalDuration[0]?.total || 0,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      skip,
    },
  };
};

// ─── Get Project Timesheet (any member) ───────────────────────────────────────
export const getProjectTimesheetService = async (
  workspaceId: string,
  projectId: string,
  filters: { startDate?: string; endDate?: string; userId?: string },
  pagination: { pageSize: number; pageNumber: number }
) => {
  // Verify project belongs to workspace
  const project = await ProjectModel.findOne({
    _id: projectId,
    workspace: workspaceId,
  });
  if (!project) throw new NotFoundException("Project not found.");

  const query: Record<string, any> = {
    workspace: workspaceId,
    project: projectId,
    endTime: { $ne: null },
  };

  if (filters.userId) query.user = filters.userId;

  if (filters.startDate || filters.endDate) {
    query.startTime = {};
    if (filters.startDate) query.startTime.$gte = new Date(filters.startDate);
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      query.startTime.$lte = end;
    }
  }

  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [entries, totalCount, totalDuration] = await Promise.all([
    TimeEntryModel.find(query)
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate("task", "_id title taskCode status priority")
      .populate("user", "_id name profilePicture email"),
    TimeEntryModel.countDocuments(query),
    TimeEntryModel.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: "$duration" } } },
    ]),
  ]);

  return {
    entries,
    totalDuration: totalDuration[0]?.total || 0,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      skip,
    },
  };
};

// ─── Get Workspace-Wide Timesheet (admin/owner) ───────────────────────────────
export const getWorkspaceTimesheetService = async (
  workspaceId: string,
  filters: {
    startDate?: string;
    endDate?: string;
    projectId?: string;
    userId?: string;
  },
  pagination: { pageSize: number; pageNumber: number }
) => {
  const query: Record<string, any> = {
    workspace: workspaceId,
    endTime: { $ne: null },
  };

  if (filters.projectId) query.project = filters.projectId;
  if (filters.userId) query.user = filters.userId;

  if (filters.startDate || filters.endDate) {
    query.startTime = {};
    if (filters.startDate) query.startTime.$gte = new Date(filters.startDate);
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      query.startTime.$lte = end;
    }
  }

  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [entries, totalCount, totalDuration] = await Promise.all([
    TimeEntryModel.find(query)
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate("task", "_id title taskCode status priority")
      .populate("project", "_id name emoji")
      .populate("user", "_id name profilePicture email"),
    TimeEntryModel.countDocuments(query),
    TimeEntryModel.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: "$duration" } } },
    ]),
  ]);

  return {
    entries,
    totalDuration: totalDuration[0]?.total || 0,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      skip,
    },
  };
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const getTimesheetAnalyticsService = async (
  workspaceId: string,
  filters: { startDate?: string; endDate?: string }
) => {
  const matchQuery: Record<string, any> = {
    workspace: new mongoose.Types.ObjectId(workspaceId),
    endTime: { $ne: null },
  };

  if (filters.startDate || filters.endDate) {
    matchQuery.startTime = {};
    if (filters.startDate)
      matchQuery.startTime.$gte = new Date(filters.startDate);
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      matchQuery.startTime.$lte = end;
    }
  }

  const [byProject, byUser, byDay] = await Promise.all([
    // Time per project
    TimeEntryModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$project",
          totalDuration: { $sum: "$duration" },
          entryCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "_id",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      {
        $project: {
          projectId: "$_id",
          projectName: "$project.name",
          projectEmoji: "$project.emoji",
          totalDuration: 1,
          entryCount: 1,
        },
      },
      { $sort: { totalDuration: -1 } },
    ]),

    // Time per user
    TimeEntryModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$user",
          totalDuration: { $sum: "$duration" },
          entryCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          userId: "$_id",
          userName: "$user.name",
          userEmail: "$user.email",
          userProfilePicture: "$user.profilePicture",
          totalDuration: 1,
          entryCount: 1,
        },
      },
      { $sort: { totalDuration: -1 } },
    ]),

    // Time per day (last 30 days)
    TimeEntryModel.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$startTime" },
          },
          totalDuration: { $sum: "$duration" },
          entryCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return { byProject, byUser, byDay };
};

// ─── Update Entry ─────────────────────────────────────────────────────────────
export const updateTimeEntryService = async (
  userId: string,
  workspaceId: string,
  entryId: string,
  body: { startTime?: string; endTime?: string; description?: string }
) => {
  const entry = await TimeEntryModel.findOne({
    _id: entryId,
    user: userId,
    workspace: workspaceId,
  });

  if (!entry) throw new NotFoundException("Time entry not found.");

  if (body.startTime) entry.startTime = new Date(body.startTime);
  if (body.endTime) entry.endTime = new Date(body.endTime);
  if (body.description !== undefined) entry.description = body.description;

  // Recalculate duration
  if (entry.endTime) {
    entry.duration = Math.max(
      0,
      Math.floor(
        (entry.endTime.getTime() - entry.startTime.getTime()) / 1000
      )
    );
  }

  await entry.save();
  return { entry };
};

// ─── Delete Entry ─────────────────────────────────────────────────────────────
export const deleteTimeEntryService = async (
  userId: string,
  workspaceId: string,
  entryId: string
) => {
  const entry = await TimeEntryModel.findOneAndDelete({
    _id: entryId,
    user: userId,
    workspace: workspaceId,
  });

  if (!entry) throw new NotFoundException("Time entry not found.");
  return;
};
