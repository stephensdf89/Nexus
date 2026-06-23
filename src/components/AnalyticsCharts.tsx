"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PlatformTimeseries, DailyMetric } from "@/hooks/useAnalytics";

const COLORS = {
  YouTube: "#FF0033",
  TikTok: "#00F7EF",
  Instagram: "#E4405F",
  Facebook: "#1877F2",
  Twitter: "#1DA1F2",
};

interface AnalyticsChartsProps {
  timeseries: PlatformTimeseries[];
}

export function ViewsOverTimeChart({ timeseries }: AnalyticsChartsProps) {
  if (!timeseries || timeseries.length === 0) {
    return <div className="text-gray-500 text-sm">No data available</div>;
  }

  // Combine all platform data into single timeline
  const combinedData: Record<string, any> = {};

  timeseries.forEach((platform) => {
    platform.data.forEach((metric) => {
      if (!combinedData[metric.date]) {
        combinedData[metric.date] = { date: metric.date };
      }
      combinedData[metric.date][platform.platform] = metric.views;
    });
  });

  const chartData = Object.values(combinedData).sort(
    (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "#94a3b8" }}
          style={{ fontSize: "12px" }}
        />
        <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "1px solid #475569",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "#00e5ff" }}
        />
        <Legend />
        {Object.keys(COLORS).map((platform) => (
          <Line
            key={platform}
            type="monotone"
            dataKey={platform}
            stroke={COLORS[platform as keyof typeof COLORS]}
            dot={false}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function EngagementOverTimeChart({ timeseries }: AnalyticsChartsProps) {
  if (!timeseries || timeseries.length === 0) {
    return <div className="text-gray-500 text-sm">No data available</div>;
  }

  // Combine all platform data
  const combinedData: Record<string, any> = {};

  timeseries.forEach((platform) => {
    platform.data.forEach((metric) => {
      if (!combinedData[metric.date]) {
        combinedData[metric.date] = { date: metric.date };
      }
      combinedData[metric.date][platform.platform] = metric.engagement;
    });
  });

  const chartData = Object.values(combinedData).sort(
    (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "#94a3b8" }}
          style={{ fontSize: "12px" }}
        />
        <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "1px solid #475569",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "#00e5ff" }}
        />
        <Legend />
        {Object.keys(COLORS).map((platform) => (
          <Bar
            key={platform}
            dataKey={platform}
            fill={COLORS[platform as keyof typeof COLORS]}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PlatformBreakdownChart({
  platforms,
}: {
  platforms: Array<{ platform: string; views: number }>;
}) {
  if (!platforms || platforms.length === 0) {
    return <div className="text-gray-500 text-sm">No data available</div>;
  }

  const chartData = platforms.map((p) => ({
    name: p.platform,
    value: p.views,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value, percent }) =>
            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                COLORS[entry.name as keyof typeof COLORS] ||
                `hsl(${index * 60}, 70%, 50%)`
              }
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "1px solid #475569",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "#00e5ff" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
