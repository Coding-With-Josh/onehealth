"use client";

/**
 * Visits chart — real data only. Buckets the authenticated patient's
 * visits by month (last 6 months) and renders an area chart. When there
 * is no data it renders an explicit empty state; it never fakes points.
 */
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import type { Visit } from "@/lib/api/patient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  visits: {
    label: "Visits",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface MonthPoint {
  month: string;
  visits: number;
}

function lastSixMonths(): Date[] {
  const months: Date[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    months.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
  }
  return months;
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function VisitsChart({ visits }: { visits: Visit[] | null }) {
  const total = visits?.length ?? 0;

  let data: MonthPoint[] = [];
  if (visits && visits.length > 0) {
    const buckets = new Map<string, number>();
    for (const v of visits) {
      const d = new Date(v.admitted_at);
      if (Number.isNaN(d.getTime())) continue;
      const key = monthKey(d);
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    data = lastSixMonths().map((m) => ({
      month: m.toLocaleDateString("en-US", { month: "short" }),
      visits: buckets.get(monthKey(m)) ?? 0,
    }));
    // Drop trailing empty months so the chart hugs the data.
    while (data.length > 1 && data[data.length - 1].visits === 0) data.pop();
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Visits</CardTitle>
        <CardDescription>
          {total === 0
            ? "No hospital visits on file yet"
            : `${total} visit${total === 1 ? "" : "s"} · last 6 months`}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {total === 0 ? (
          <div className="flex aspect-auto h-[180px] w-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            Your visits will appear here.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[180px] w-full"
          >
            <AreaChart data={data}>
              <defs>
                <linearGradient id="fillVisits" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-visits)"
                    stopOpacity={1.0}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-visits)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={16}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                dataKey="visits"
                type="natural"
                fill="url(#fillVisits)"
                stroke="var(--color-visits)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}