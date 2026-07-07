import { useState } from "react";
import { subDays, format } from "date-fns";
import {
  Clock,
  CalendarRange,
  BarChart3,
  Users,
  FolderOpen,
  RefreshCw,
  Filter,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimesheetTable } from "@/components/workspace/timesheet/TimesheetTable";
import { TimesheetAnalyticsCharts } from "@/components/workspace/timesheet/TimesheetAnalyticsCharts";
import { ManualEntryDialog } from "@/components/workspace/timesheet/ManualEntryDialog";
import {
  useMyTimesheet,
  useWorkspaceTimesheet,
  useTimesheetAnalytics,
  useProjectTimesheet,
} from "@/hooks/api/use-timesheet";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useAuthContext } from "@/context/auth-provider";
import { Permissions } from "@/constant";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";

const DEFAULT_START = format(subDays(new Date(), 29), "yyyy-MM-dd");
const DEFAULT_END = format(new Date(), "yyyy-MM-dd");

export default function TimesheetPage() {
  const workspaceId = useWorkspaceId();
  const { hasPermission } = useAuthContext();
  const isAdmin = hasPermission(Permissions.MANAGE_WORKSPACE_SETTINGS);

  // Shared date filters
  const [startDate, setStartDate] = useState(DEFAULT_START);
  const [endDate, setEndDate] = useState(DEFAULT_END);

  // My Timesheet filters
  const [myProjectId, setMyProjectId] = useState("");
  const [myPage, setMyPage] = useState(1);

  // Project Report filters
  const [reportProjectId, setReportProjectId] = useState("");
  const [reportUserId, setReportUserId] = useState("");
  const [reportPage, setReportPage] = useState(1);

  // Team Overview filters (admin)
  const [teamProjectId, setTeamProjectId] = useState("");
  const [teamUserId, setTeamUserId] = useState("");
  const [teamPage, setTeamPage] = useState(1);

  // Data
  const myTimesheet = useMyTimesheet({
    workspaceId,
    startDate,
    endDate,
    projectId: myProjectId || undefined,
    pageNumber: myPage,
    pageSize: 15,
  });

  const projectTimesheet = useProjectTimesheet({
    workspaceId,
    projectId: reportProjectId,
    userId: reportUserId || undefined,
    startDate,
    endDate,
    pageNumber: reportPage,
    pageSize: 15,
  });

  const workspaceTimesheet = useWorkspaceTimesheet({
    workspaceId,
    projectId: teamProjectId || undefined,
    userId: teamUserId || undefined,
    startDate,
    endDate,
    pageNumber: teamPage,
    pageSize: 15,
  });

  const analyticsData = useTimesheetAnalytics(workspaceId, startDate, endDate);

  const { data: projectsData } = useGetProjectsInWorkspaceQuery({ workspaceId });
  const { data: membersData } = useGetWorkspaceMembers(workspaceId);

  const projects = projectsData?.projects || [];
  const members = membersData?.members || [];

  const resetDates = () => {
    setStartDate(DEFAULT_START);
    setEndDate(DEFAULT_END);
  };

  return (
    <main className="flex flex-1 flex-col py-4 md:pt-3 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="h-6 w-6 text-indigo-500" />
            Timesheet
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track time on tasks, view reports and team analytics.
          </p>
        </div>
        <ManualEntryDialog />
      </div>

      {/* Global Date Range Filter */}
      <Card className="border-dashed">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Date Range</span>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs" htmlFor="start-date">
                From
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                max={endDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 text-sm w-36"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs" htmlFor="end-date">
                To
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                min={startDate}
                max={format(new Date(), "yyyy-MM-dd")}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 text-sm w-36"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetDates}
              className="h-8 gap-1.5 text-xs"
            >
              <RefreshCw className="h-3 w-3" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="my" className="w-full">
        <TabsList className="w-full justify-start border bg-background h-11 px-1 gap-1">
          <TabsTrigger value="my" className="gap-2 text-sm">
            <Clock className="h-3.5 w-3.5" />
            My Timesheet
          </TabsTrigger>
          <TabsTrigger value="project" className="gap-2 text-sm">
            <FolderOpen className="h-3.5 w-3.5" />
            Project Report
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2 text-sm">
            <BarChart3 className="h-3.5 w-3.5" />
            Analytics
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="team" className="gap-2 text-sm">
              <Users className="h-3.5 w-3.5" />
              Team Overview
            </TabsTrigger>
          )}
        </TabsList>

        {/* ── My Timesheet ── */}
        <TabsContent value="my" className="mt-6 space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <Select
              value={myProjectId}
              onValueChange={(v) => {
                setMyProjectId(v === "all" ? "" : v);
                setMyPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-sm w-48">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.emoji} {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <TimesheetTable
            entries={myTimesheet.data?.entries || []}
            totalDuration={myTimesheet.data?.totalDuration || 0}
            isLoading={myTimesheet.isLoading}
            showUser={false}
            totalCount={myTimesheet.data?.pagination.totalCount || 0}
            pageNumber={myPage}
            pageSize={15}
            totalPages={myTimesheet.data?.pagination.totalPages || 1}
            onPageChange={setMyPage}
          />
        </TabsContent>

        {/* ── Project Report ── */}
        <TabsContent value="project" className="mt-6 space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <Select
              value={reportProjectId}
              onValueChange={(v) => {
                setReportProjectId(v === "none" ? "" : v);
                setReportPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-sm w-52">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select a project…</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.emoji} {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={reportUserId}
              onValueChange={(v) => {
                setReportUserId(v === "all" ? "" : v);
                setReportPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-sm w-44">
                <SelectValue placeholder="All Members" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m._id} value={m.userId._id}>
                    {m.userId.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!reportProjectId ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                <FolderOpen className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Select a project to see its time report
              </p>
            </div>
          ) : (
            <TimesheetTable
              entries={projectTimesheet.data?.entries || []}
              totalDuration={projectTimesheet.data?.totalDuration || 0}
              isLoading={projectTimesheet.isLoading}
              showUser={true}
              totalCount={projectTimesheet.data?.pagination.totalCount || 0}
              pageNumber={reportPage}
              pageSize={15}
              totalPages={projectTimesheet.data?.pagination.totalPages || 1}
              onPageChange={setReportPage}
            />
          )}
        </TabsContent>

        {/* ── Analytics ── */}
        <TabsContent value="analytics" className="mt-6">
          <TimesheetAnalyticsCharts
            data={analyticsData.data?.analytics}
            isLoading={analyticsData.isLoading}
          />
        </TabsContent>

        {/* ── Team Overview (Admin/Owner only) ── */}
        {isAdmin && (
          <TabsContent value="team" className="mt-6 space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <Select
                value={teamProjectId}
                onValueChange={(v) => {
                  setTeamProjectId(v === "all" ? "" : v);
                  setTeamPage(1);
                }}
              >
                <SelectTrigger className="h-8 text-sm w-48">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.emoji} {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={teamUserId}
                onValueChange={(v) => {
                  setTeamUserId(v === "all" ? "" : v);
                  setTeamPage(1);
                }}
              >
                <SelectTrigger className="h-8 text-sm w-44">
                  <SelectValue placeholder="All Members" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m._id} value={m.userId._id}>
                      {m.userId.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <TimesheetTable
              entries={workspaceTimesheet.data?.entries || []}
              totalDuration={workspaceTimesheet.data?.totalDuration || 0}
              isLoading={workspaceTimesheet.isLoading}
              showUser={true}
              totalCount={workspaceTimesheet.data?.pagination.totalCount || 0}
              pageNumber={teamPage}
              pageSize={15}
              totalPages={workspaceTimesheet.data?.pagination.totalPages || 1}
              onPageChange={setTeamPage}
            />
          </TabsContent>
        )}
      </Tabs>
    </main>
  );
}
