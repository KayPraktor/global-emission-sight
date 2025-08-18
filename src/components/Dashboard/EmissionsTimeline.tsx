import React, { useEffect, useMemo, useState } from "react";
import {
  EnhancedCard as Card,
  EnhancedCardContent as CardContent,
  EnhancedCardHeader as CardHeader,
  EnhancedCardTitle as CardTitle,
} from "@/components/ui/enhanced-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus, Info, AlertTriangle } from "lucide-react";

interface MonthDatum {
  month: string; // e.g., "Jan"
  emissions: number; // tons CO2e
  change: number; // % vs previous month (can be negative)
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const normalizeMonth = (m: string) => {
  if (!m) return "";
  const abbr = m.slice(0, 3).toLowerCase();
  return abbr.charAt(0).toUpperCase() + abbr.slice(1);
};

const fallbackData: MonthDatum[] = MONTHS.map((m, i) => ({
  month: m,
  emissions: Math.round(40 + i * 3 + (i % 3 === 0 ? 6 : 0)),
  change: i === 0 ? 0 : (i % 2 === 0 ? -4 : 5),
}));

const EmissionsTimeline: React.FC = () => {
  const [data, setData] = useState<MonthDatum[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/carbon/monthly", {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as MonthDatum[];
        if (!Array.isArray(json)) throw new Error("Invalid response");
        if (mounted) {
          setData(json);
          setLoading(false);
        }
      } catch (e: any) {
        // Fallback to local sample so the UI still renders nicely
        if (mounted) {
          setError(e?.message ?? "Failed to load");
          setData(fallbackData);
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const currentMonthIndex = new Date().getMonth();

  const timeline = useMemo(() => {
    const source = data ?? fallbackData;
    // Normalize and sort into calendar order, de-duplicate by month
    const normalized = source
      .map((d) => ({
        ...d,
        month: normalizeMonth(d.month),
      }))
      .filter((d) => MONTHS.includes(d.month));

    const byMonth = new Map<string, MonthDatum>();
    normalized.forEach((d) => byMonth.set(d.month, d));

    return MONTHS.map((m) => byMonth.get(m) || { month: m, emissions: 0, change: 0 });
  }, [data]);

  return (
    <TooltipProvider>
      <Card variant="gradient" className="w-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Monthly Carbon Emissions Timeline</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track monthly tCO₂e and change vs previous month
              </p>
            </div>
            {error && (
              <Tooltip>
                <TooltipTrigger>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Using demo data: {error}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span>Current month</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span>Increase vs previous</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowDownRight className="h-3 w-3 text-red-500" />
              <span>Decrease vs previous</span>
            </div>
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1 cursor-help">
                <Info className="h-3 w-3" />
                <span>tCO₂e</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tons of carbon dioxide equivalent - a standard unit for measuring greenhouse gas emissions</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-5 w-56" />
            <div className="overflow-x-auto">
              <div className="flex gap-8 min-w-max py-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center min-w-[88px]">
                    <Skeleton className="h-3 w-10 mb-3" />
                    <Skeleton className="h-6 w-6 rounded-full mb-3" />
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative overflow-x-auto py-6 animate-fade-in">
            {/* Enhanced connecting line with gradient */}
            <div
              className="pointer-events-none absolute left-0 right-0 top-[46px] h-0.5 bg-gradient-to-r from-border via-primary/20 to-border"
              aria-hidden
            />
            <div className="flex gap-8 min-w-max px-1">
              {timeline.map((item, idx) => {
                const isCurrent = idx === currentMonthIndex;
                const monthLabel = normalizeMonth(item.month).toUpperCase();
                const change = item.change ?? 0;
                const ChangeIcon = change > 0 ? ArrowUpRight : change < 0 ? ArrowDownRight : Minus;
                const changeColor = change > 0 ? "text-primary" : change < 0 ? "text-destructive" : "text-muted-foreground";
                const changeText = `${change > 0 ? "+" : ""}${change}% vs prev`;

                return (
                  <Tooltip key={item.month}>
                    <TooltipTrigger asChild>
                      <div
                        className="flex flex-col items-center min-w-[88px] rounded-lg p-2 transition-all duration-200 hover:scale-105 hover:bg-muted/30 cursor-pointer"
                        aria-label={`${monthLabel}: ${item.emissions} tCO2e, ${change}% vs previous`}
                      >
                        <div className="text-xs tracking-wide font-semibold text-foreground mb-2">
                          {monthLabel}
                        </div>

                    {/* Dot */}
                    <div className="relative flex items-center justify-center mb-3">
                      {isCurrent && (
                        <div
                          className="absolute -inset-2 rounded-full bg-primary/25 blur-md opacity-70 pulse"
                          aria-hidden
                        />
                      )}
                      <div
                        className={cn(
                          "rounded-full border border-border shadow-sm transition-all duration-200",
                          isCurrent
                            ? "w-8 h-8 bg-primary text-primary-foreground ring-4 ring-primary/25"
                            : "w-6 h-6 bg-secondary hover:bg-muted"
                        )}
                      />
                    </div>

                        {/* Emissions value */}
                        <div className="text-sm font-bold text-foreground">
                          {item.emissions.toLocaleString()} tCO₂e
                        </div>
                        {/* Change vs previous */}
                        <div className={cn("mt-1 flex items-center gap-1 text-xs font-medium", changeColor)}>
                          <ChangeIcon className="h-3 w-3" aria-hidden />
                          <span>{changeText}</span>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-2">
                        <div className="font-semibold">{monthLabel} 2024</div>
                        <div>
                          <span className="text-muted-foreground">Emissions: </span>
                          <span className="font-medium">{item.emissions.toLocaleString()} tCO₂e</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Change: </span>
                          <span className={cn("font-medium", changeColor)}>
                            {change > 0 ? "+" : ""}{change}% vs previous month
                          </span>
                        </div>
                        {isCurrent && (
                          <div className="text-xs text-primary font-medium">Current month</div>
                        )}
                        <div className="text-xs text-muted-foreground pt-1 border-t">
                          Click for detailed breakdown
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </TooltipProvider>
  );
};

export default EmissionsTimeline;
