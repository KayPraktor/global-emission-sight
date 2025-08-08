import React, { useMemo, useState } from "react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

export interface DoughnutChartDatum {
  name: string;
  value: number;
  color?: string; // Prefer semantic tokens, but hex is supported for backward compatibility
}

interface DoughnutChartProps {
  data: DoughnutChartDatum[];
  className?: string;
  centerContent?: React.ReactNode;
  innerRadius?: number | string; // supports percentage for responsive sizing
  outerRadius?: number | string;
  showLegend?: boolean;
}

const DEFAULT_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--muted))",
  "hsl(var(--accent))",
  "hsl(var(--destructive))",
  "hsl(var(--ring))",
];

export default function DoughnutChart({
  data,
  className,
  centerContent,
  innerRadius = "55%",
  outerRadius = "80%",
  showLegend = true,
}: DoughnutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  // Build chart config for theming/legend
  const chartConfig = useMemo(() => {
    const cfg: Record<string, { label: string; color: string }> = {};
    data.forEach((d, i) => {
      cfg[d.name] = {
        label: d.name,
        color: d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      };
    });
    return cfg;
  }, [data]);

  const total = useMemo(
    () => data.reduce((sum, d) => sum + (Number.isFinite(d.value) ? d.value : 0), 0),
    [data]
  );

  return (
    <div className={cn("relative h-full w-full", className)} aria-label="Doughnut chart">
      <ChartContainer config={chartConfig} className="h-full w-full">
          <RePieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              isAnimationActive
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`slice-${entry.name}-${index}`}
                  fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                  opacity={activeIndex === undefined || activeIndex === index ? 1 : 0.6}
                />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
            {showLegend && (
              <ChartLegend verticalAlign="bottom" content={<ChartLegendContent nameKey="name" />} />
            )}
          </RePieChart>
      </ChartContainer>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          {centerContent ? (
            centerContent
          ) : (
            <>
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="text-sm font-semibold text-foreground tabular-nums">
                {total.toLocaleString()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
