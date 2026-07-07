import { useState } from "react";
import { Play, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveTimer, useStartTimer, useStopTimer } from "@/hooks/api/use-timesheet";
import { useLiveTimer } from "@/hooks/use-live-timer";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TimerControlProps {
  taskId: string;
  projectId: string;
  taskTitle?: string;
}

export function TimerControl({ taskId, projectId, taskTitle }: TimerControlProps) {
  const workspaceId = useWorkspaceId();
  const { toast } = useToast();
  const { data: activeData } = useActiveTimer(workspaceId);
  const startTimer = useStartTimer();
  const stopTimer = useStopTimer();

  const [showStopDialog, setShowStopDialog] = useState(false);
  const [description, setDescription] = useState("");

  const activeTimer = activeData?.activeTimer;
  const isThisTaskActive = activeTimer?.task._id === taskId;
  const isOtherTaskActive = !!activeTimer && !isThisTaskActive;

  const { formatted } = useLiveTimer(isThisTaskActive ? activeTimer.startTime : null);

  const handleStart = () => {
    startTimer.mutate(
      { workspaceId, data: { taskId, projectId } },
      {
        onSuccess: () => toast({ title: "⏱ Timer started" }),
        onError: (error: any) => {
          toast({
            title: "Cannot start timer",
            description: error?.response?.data?.message || "A timer may already be running.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleStop = () => {
    if (!activeTimer) return;
    stopTimer.mutate(
      {
        workspaceId,
        entryId: activeTimer._id,
        data: { description: description.trim() || undefined },
      },
      {
        onSuccess: () => {
          toast({ title: "Timer stopped", description: `Logged: ${formatted}` });
          setShowStopDialog(false);
          setDescription("");
        },
        onError: () => {
          toast({ title: "Failed to stop timer", variant: "destructive" });
        },
      }
    );
  };

  if (isThisTaskActive) {
    return (
      <>
        <div className="flex items-center gap-2">
          {/* Live time display */}
          <span className="font-mono text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {formatted}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowStopDialog(true)}
            className="h-7 px-2 text-red-600 border-red-200 hover:bg-red-50"
            disabled={stopTimer.isPending}
          >
            {stopTimer.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Square className="h-3 w-3 fill-current" />
            )}
          </Button>
        </div>

        {/* Stop dialog */}
        <Dialog open={showStopDialog} onOpenChange={setShowStopDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Stop Timer — {taskTitle}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-2xl font-mono font-bold text-emerald-600">{formatted}</p>
              <div className="space-y-2">
                <Label htmlFor="tc-description">Work notes (optional)</Label>
                <Textarea
                  id="tc-description"
                  placeholder="What did you accomplish?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStopDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleStop} disabled={stopTimer.isPending}>
                {stopTimer.isPending ? "Saving..." : "Stop & Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleStart}
      disabled={startTimer.isPending || isOtherTaskActive}
      title={isOtherTaskActive ? "Stop the current timer first" : "Start timer"}
      className="h-7 px-2 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
    >
      {startTimer.isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Play className="h-3 w-3" />
      )}
    </Button>
  );
}
