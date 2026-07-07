export type TimeEntryType = {
  _id: string;
  task: {
    _id: string;
    title: string;
    taskCode: string;
    status?: string;
    priority?: string;
  };
  project: {
    _id: string;
    name: string;
    emoji: string;
  };
  workspace: string;
  user: {
    _id: string;
    name: string;
    email: string;
    profilePicture: string | null;
  };
  startTime: string;
  endTime: string | null;
  duration: number; // seconds
  description: string | null;
  isManual: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ActiveTimerType = {
  _id: string;
  task: { _id: string; title: string; taskCode: string };
  project: { _id: string; name: string; emoji: string };
  startTime: string;
  endTime: null;
  duration: number;
  isManual: false;
};

export type TimesheetPaginationType = {
  pageSize: number;
  pageNumber: number;
  totalCount: number;
  totalPages: number;
  skip: number;
};

export type TimesheetResponseType = {
  message: string;
  entries: TimeEntryType[];
  totalDuration: number;
  pagination: TimesheetPaginationType;
};

export type ActiveTimerResponseType = {
  message: string;
  activeTimer: ActiveTimerType | null;
};

export type StartTimerPayloadType = {
  workspaceId: string;
  data: { taskId: string; projectId: string };
};

export type StopTimerPayloadType = {
  workspaceId: string;
  entryId: string;
  data: { description?: string };
};

export type ManualEntryPayloadType = {
  workspaceId: string;
  data: {
    taskId: string;
    projectId: string;
    startTime: string;
    endTime: string;
    description?: string;
  };
};

export type UpdateEntryPayloadType = {
  workspaceId: string;
  entryId: string;
  data: {
    startTime?: string;
    endTime?: string;
    description?: string;
  };
};

export type TimesheetFilterType = {
  workspaceId: string;
  startDate?: string;
  endDate?: string;
  projectId?: string;
  userId?: string;
  pageSize?: number;
  pageNumber?: number;
};

export type TimesheetAnalyticsType = {
  message: string;
  analytics: {
    byProject: {
      projectId: string;
      projectName: string;
      projectEmoji: string;
      totalDuration: number;
      entryCount: number;
    }[];
    byUser: {
      userId: string;
      userName: string;
      userEmail: string;
      userProfilePicture: string | null;
      totalDuration: number;
      entryCount: number;
    }[];
    byDay: {
      _id: string; // "YYYY-MM-DD"
      totalDuration: number;
      entryCount: number;
    }[];
  };
};
