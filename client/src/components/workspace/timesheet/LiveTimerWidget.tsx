import { useState } from "react";
import { Square, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useActiveTimer, useStopTimer } from "@/hooks/api/use-timesheet";
import { useLiveTimer } from "@/hooks/use-live-timer";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export function LiveTimerWidget() {
  const workspaceId = useWorkspaceId();
  const { toast } = useToast();
  const { data, isLoading } = useActiveTimer(workspaceId);
  const stopTimer = useStopTimer();

  const [showStopDialog, setShowStopDialog] = useState(false);
  const [description, setDescription] = useState("");

  const activeTimer = data?.activeTimer;
  const { formatted } = useLiveTimer(activeTimer?.startTime ?? null);

  const handleStop = async () => {
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
          toast({
            title: "Failed to stop timer",
            variant: "destructive",
          });
        },
      }
    );
  };

  if (isLoading || !activeTimer) return null;

  return (
    <>
      {/* Floating widget */}
      <div className="flex items-center gap-2 bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm animate-pulse-subtle">
        {/* Pulsing dot */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>

        <Clock className="h-3.5 w-3.5 text-emerald-400" />

        <Link
          to={`/workspace/${workspaceId}/timesheet`}
          className="text-xs font-mono font-semibold text-emerald-200 hover:text-white transition-colors max-w-[160px] truncate"
          title={activeTimer.task.title}
        >
          {activeTimer.task.title}
        </Link>

        <Badge
          variant="outline"
          className="font-mono text-xs border-emerald-500/40 text-emerald-300 bg-emerald-950/50 px-2"
        >
          {formatted}
        </Badge>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowStopDialog(true)}
          className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-full transition-colors"
          title="Stop timer"
        >
          <Square className="h-3 w-3 fill-current" />
        </Button>
      </div>

      {/* Stop + Description Dialog */}
      <Dialog open={showStopDialog} onOpenChange={setShowStopDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Square className="h-4 w-4 text-red-500 fill-red-500" />
              Stop Timer
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Summary */}
            <div className="rounded-lg bg-muted p-3 space-y-1">
              <p className="text-sm font-medium">{activeTimer.task.title}</p>
              <p className="text-xs text-muted-foreground">
                {activeTimer.project.emoji} {activeTimer.project.name}
              </p>
              <p className="text-2xl font-mono font-bold text-emerald-600">
                {formatted}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="stop-description">
                What did you work on?{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="stop-description"
                placeholder="Describe what you accomplished..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStopDialog(false)}
              disabled={stopTimer.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleStop}
              disabled={stopTimer.isPending}
            >
              <Square className="h-3.5 w-3.5 mr-1.5 fill-current" />
              {stopTimer.isPending ? "Stopping..." : "Stop & Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
