import { useState, useEffect } from "react";
import { CalendarIcon, Clock, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLogManualEntry } from "@/hooks/api/use-timesheet";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useToast } from "@/hooks/use-toast";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import { useQuery } from "@tanstack/react-query";
import { getAllTasksQueryFn } from "@/lib/api";

interface ManualEntryDialogProps {
  defaultProjectId?: string;
  defaultTaskId?: string;
}

export function ManualEntryDialog({
  defaultProjectId,
  defaultTaskId,
}: ManualEntryDialogProps) {
  const workspaceId = useWorkspaceId();
  const { toast } = useToast();
  const logEntry = useLogManualEntry();
  const [open, setOpen] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");
  const [projectId, setProjectId] = useState(defaultProjectId || "");
  const [taskId, setTaskId] = useState(defaultTaskId || "");
  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [description, setDescription] = useState("");

  // Projects
  const { data: projectsData } = useGetProjectsInWorkspaceQuery({ workspaceId, skip: !open });

  // Tasks for selected project
  const { data: tasksData } = useQuery({
    queryKey: ["tasks-for-timesheet", workspaceId, projectId],
    queryFn: () =>
      getAllTasksQueryFn({ workspaceId, projectId: projectId || null }),
    enabled: !!workspaceId && !!projectId && open,
    staleTime: 30_000,
  });

  // Reset taskId when project changes
  useEffect(() => {
    if (!defaultTaskId) setTaskId("");
  }, [projectId, defaultTaskId]);

  const computedDuration = () => {
    if (!startTime || !endTime) return null;
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    const diff = (end.getTime() - start.getTime()) / 60000; // minutes
    if (diff <= 0) return null;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const handleSubmit = () => {
    if (!projectId || !taskId) {
      toast({ title: "Select a project and task", variant: "destructive" });
      return;
    }
    const startISO = new Date(`${date}T${startTime}`).toISOString();
    const endISO = new Date(`${date}T${endTime}`).toISOString();

    logEntry.mutate(
      {
        workspaceId,
        data: {
          taskId,
          projectId,
          startTime: startISO,
          endTime: endISO,
          description: description.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Time entry logged successfully" });
          setOpen(false);
          setDescription("");
          if (!defaultProjectId) setProjectId("");
          if (!defaultTaskId) setTaskId("");
        },
        onError: (err: any) => {
          toast({
            title: "Failed to log entry",
            description: err?.response?.data?.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Log Time
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Log Time Manually
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Project */}
          <div className="space-y-2">
            <Label>Project</Label>
            <Select
              value={projectId}
              onValueChange={setProjectId}
              disabled={!!defaultProjectId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projectsData?.projects?.map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.emoji} {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Task */}
          <div className="space-y-2">
            <Label>Task</Label>
            <Select
              value={taskId}
              onValueChange={setTaskId}
              disabled={!projectId || !!defaultTaskId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a task" />
              </SelectTrigger>
              <SelectContent>
                {tasksData?.tasks?.map((t) => (
                  <SelectItem key={t._id} value={t._id}>
                    <span className="text-xs text-muted-foreground mr-2">
                      {t.taskCode}
                    </span>
                    {t.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>
              <CalendarIcon className="h-3.5 w-3.5 inline mr-1" />
              Date
            </Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={today}
            />
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Duration preview */}
          {computedDuration() && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-emerald-700 font-medium">
                Duration: <strong>{computedDuration()}</strong>
              </span>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              placeholder="What did you work on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={logEntry.isPending || !projectId || !taskId}
          >
            {logEntry.isPending ? "Saving..." : "Log Entry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
