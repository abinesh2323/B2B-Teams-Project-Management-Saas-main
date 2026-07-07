import mongoose, { Document, Schema } from "mongoose";

export interface TimeEntryDocument extends Document {
  task: mongoose.Types.ObjectId;
  project: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date | null;
  duration: number; // in seconds
  description: string | null;
  isManual: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const timeEntrySchema = new Schema<TimeEntryDocument>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number,
      default: 0, // seconds
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    isManual: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast per-user, per-workspace queries
timeEntrySchema.index({ user: 1, workspace: 1, startTime: -1 });
timeEntrySchema.index({ workspace: 1, project: 1, startTime: -1 });
timeEntrySchema.index({ workspace: 1, endTime: 1 }); // for finding active timers

const TimeEntryModel = mongoose.model<TimeEntryDocument>(
  "TimeEntry",
  timeEntrySchema
);

export default TimeEntryModel;
