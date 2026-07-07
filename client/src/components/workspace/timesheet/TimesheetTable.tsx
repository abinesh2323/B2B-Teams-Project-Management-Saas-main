import { useState } from "react";
import { format } from "date-fns";
import {
  Pencil,
  Trash2,
  Clock,
  CheckCircle2,
  Loader2,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteTimeEntry, useUpdateTimeEntry } from "@/hooks/api/use-timesheet";
import { formatDuration } from "@/hooks/use-live-timer";
import { TimeEntryType } from "@/types/timeEntry.type";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useToast } from "@/hooks/use-toast";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";

interface TimesheetTableProps {
  entries: TimeEntryType[];
  totalDuration: number;
  isLoading?: boolean;
  showUser?: boolean;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function TimesheetTable({
  entries,
  totalDuration,
  isLoading,
  showUser = false,
  totalCount,
  pageNumber,
  pageSize,
  totalPages,
  onPageChange,
}: TimesheetTableProps) {
  const workspaceId = useWorkspaceId();
  const { toast } = useToast();
  const deleteEntry = useDeleteTimeEntry();
  const updateEntry = useUpdateTimeEntry();

  const [editEntry, setEditEntry] = useState<TimeEntryType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");

  const openEdit = (entry: TimeEntryType) => {
    setEditEntry(entry);
    setEditDescription(entry.description || "");
    setEditStartTime(format(new Date(entry.startTime), "yyyy-MM-dd'T'HH:mm"));
    setEditEndTime(
      entry.endTime
        ? format(new Date(entry.endTime), "yyyy-MM-dd'T'HH:mm")
        : ""
    );
  };

  const handleUpdate = () => {
    if (!editEntry) return;
    updateEntry.mutate(
      {
        workspaceId,
        entryId: editEntry._id,
        data: {
          startTime: editStartTime ? new Date(editStartTime).toISOString() : undefined,
          endTime: editEndTime ? new Date(editEndTime).toISOString() : undefined,
          description: editDescription,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Entry updated" });
          setEditEntry(null);
        },
        onError: (err: any) =>
          toast({
            title: "Update failed",
            description: err?.response?.data?.message,
            variant: "destructive",
          }),
      }
    );
  };

  const handleDelete = (entryId: string) => {
    deleteEntry.mutate(
      { workspaceId, entryId },
      {
        onSuccess: () => {
          toast({ title: "Entry deleted" });
          setDeleteTarget(null);
        },
        onError: () =>
          toast({ title: "Delete failed", variant: "destructive" }),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (!entries.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          <Clock className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          No time entries found
        </p>
        <p className="text-xs text-muted-foreground/70">
          Start a timer or log time manually to see entries here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center gap-4 bg-muted/40 rounded-lg px-4 py-2">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span className="text-muted-foreground">{totalCount} entries</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Clock className="h-4 w-4 text-primary" />
          <span>Total: {formatDuration(totalDuration)}</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Date</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Project</TableHead>
              {showUser && <TableHead>Member</TableHead>}
              <TableHead>Duration</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry._id} className="hover:bg-muted/30 group">
                {/* Date */}
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  <div>{format(new Date(entry.startTime), "MMM d, yyyy")}</div>
                  <div className="text-[10px]">
                    {format(new Date(entry.startTime), "h:mm a")} –{" "}
                    {entry.endTime
                      ? format(new Date(entry.endTime), "h:mm a")
                      : "running"}
                  </div>
                </TableCell>

                {/* Task */}
                <TableCell>
                  <div className="font-medium text-sm line-clamp-1 max-w-[180px]">
                    {entry.task.title}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    {entry.task.taskCode}
                  </div>
                </TableCell>

                {/* Project */}
                <TableCell>
                  <span className="text-sm">
                    {entry.project.emoji} {entry.project.name}
                  </span>
                </TableCell>

                {/* User (if showing workspace view) */}
                {showUser && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={entry.user?.profilePicture || ""} />
                        <AvatarFallback
                          className="text-[10px]"
                          style={{
                            background: getAvatarColor(entry.user?.name || ""),
                          }}
                        >
                          {getAvatarFallbackText(entry.user?.name || "")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{entry.user?.name}</span>
                    </div>
                  </TableCell>
                )}

                {/* Duration */}
                <TableCell>
                  <span className="font-mono text-sm font-semibold text-primary">
                    {formatDuration(entry.duration)}
                  </span>
                </TableCell>

                {/* Description */}
                <TableCell>
                  {entry.description ? (
                    <span
                      className="text-xs text-muted-foreground max-w-[200px] block truncate"
                      title={entry.description}
                    >
                      <FileText className="h-3 w-3 inline mr-1" />
                      {entry.description}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground/40">—</span>
                  )}
                </TableCell>

                {/* Type */}
                <TableCell>
                  <Badge
                    variant={entry.isManual ? "outline" : "secondary"}
                    className="text-[10px]"
                  >
                    {entry.isManual ? "Manual" : "Timer"}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(entry)}
                      className="h-7 w-7 p-0"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteTarget(entry._id)}
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {(pageNumber - 1) * pageSize + 1}–
            {Math.min(pageNumber * pageSize, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPageChange(pageNumber - 1)}
              disabled={pageNumber === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs">
              {pageNumber} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPageChange(pageNumber + 1)}
              disabled={pageNumber === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editEntry} onOpenChange={(o) => !o && setEditEntry(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Time Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="datetime-local"
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="datetime-local"
                  value={editEndTime}
                  onChange={(e) => setEditEndTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEntry(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateEntry.isPending}>
              {updateEntry.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Time Entry?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              disabled={deleteEntry.isPending}
            >
              {deleteEntry.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
