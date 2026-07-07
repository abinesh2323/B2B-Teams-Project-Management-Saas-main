import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Clock, TrendingUp, Users, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDecimalHours, formatDuration } from "@/hooks/use-live-timer";
import { TimesheetAnalyticsType } from "@/types/timeEntry.type";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";

const CHART_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#f43f5e", // rose
];

interface TimesheetAnalyticsChartsProps {
  data: TimesheetAnalyticsType["analytics"] | undefined;
  isLoading: boolean;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-medium mb-1">{label}</p>
        <p className="text-primary font-mono">
          {formatDuration(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export function TimesheetAnalyticsCharts({
  data,
  isLoading,
}: TimesheetAnalyticsChartsProps) {
  // Compute summary stats
  const totalHours = useMemo(() => {
    if (!data?.byUser) return 0;
    return data.byUser.reduce((sum, u) => sum + u.totalDuration, 0);
  }, [data]);

  const totalEntries = useMemo(() => {
    if (!data?.byUser) return 0;
    return data.byUser.reduce((sum, u) => sum + u.entryCount, 0);
  }, [data]);

  // Format daily data for bar chart
  const dailyChartData = useMemo(() => {
    if (!data?.byDay) return [];
    return data.byDay.map((d) => ({
      date: new Date(d._id).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      seconds: d.totalDuration,
      hours: parseFloat((d.totalDuration / 3600).toFixed(2)),
    }));
  }, [data]);

  // Project pie data
  const projectPieData = useMemo(() => {
    if (!data?.byProject) return [];
    return data.byProject.slice(0, 8).map((p) => ({
      name: `${p.projectEmoji} ${p.projectName}`,
      value: p.totalDuration,
      hours: parseFloat((p.totalDuration / 3600).toFixed(2)),
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-indigo-600/80 font-medium">
                  Total Hours
                </p>
                <p className="text-xl font-bold text-indigo-700">
                  {formatDecimalHours(totalHours)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-50 to-violet-100/50 border-violet-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-violet-500 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-violet-600/80 font-medium">
                  Entries
                </p>
                <p className="text-xl font-bold text-violet-700">
                  {totalEntries}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-emerald-600/80 font-medium">
                  Projects
                </p>
                <p className="text-xl font-bold text-emerald-700">
                  {data.byProject?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-pink-100/50 border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-pink-500 flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-pink-600/80 font-medium">
                  Contributors
                </p>
                <p className="text-xl font-bold text-pink-700">
                  {data.byUser?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Hours Bar Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              Hours Per Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyChartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                No data for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={dailyChartData}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    unit="h"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="seconds"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                    name="Duration"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Project Pie Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-violet-500" />
              Time by Project
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projectPieData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                No data for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={projectPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {projectPieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, _name: any, props: any) => [
                      formatDuration(value as number),
                      props.payload.name,
                    ]}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) =>
                      value.length > 20 ? value.slice(0, 20) + "…" : value
                    }
                    wrapperStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Leaderboard */}
      {data.byUser && data.byUser.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-pink-500" />
              Team Time Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Entries</TableHead>
                  <TableHead>Total Time</TableHead>
                  <TableHead>Avg/Entry</TableHead>
                  <TableHead>Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.byUser.map((u, idx) => {
                  const sharePercent =
                    totalHours > 0
                      ? ((u.totalDuration / totalHours) * 100).toFixed(1)
                      : "0";
                  const avgPerEntry =
                    u.entryCount > 0
                      ? Math.floor(u.totalDuration / u.entryCount)
                      : 0;
                  return (
                    <TableRow key={u.userId}>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        #{idx + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={u.userProfilePicture || ""} />
                            <AvatarFallback
                              className="text-[10px]"
                              style={{
                                background: getAvatarColor(u.userName),
                              }}
                            >
                              {getAvatarFallbackText(u.userName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{u.userName}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {u.userEmail}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{u.entryCount}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm font-semibold text-primary">
                          {formatDuration(u.totalDuration)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDuration(avgPerEntry)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-1.5 w-24">
                            <div
                              className="h-1.5 rounded-full bg-indigo-500 transition-all"
                              style={{ width: `${sharePercent}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {sharePercent}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
