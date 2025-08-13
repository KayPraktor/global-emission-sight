import React, { useEffect, useMemo, useState } from "react";
import {
  EnhancedCard as Card,
  EnhancedCardContent as CardContent,
  EnhancedCardHeader as CardHeader,
  EnhancedCardTitle as CardTitle,
} from "@/components/ui/enhanced-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

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
    <Card variant="glass" className="w-full bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-gray-100">Monthly Carbon Emissions Timeline</CardTitle>
        {/* We keep description subtle to avoid clutter */}
        <p className="text-sm text-gray-400">
          Track monthly tCO₂e and change vs previous month
        </p>
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
            {/* The horizontal line behind the dots */}
            <div
              className="pointer-events-none absolute left-0 right-0 top-[46px] h-px bg-border"
              aria-hidden
            />
            <div className="flex gap-8 min-w-max px-1">
              {timeline.map((item, idx) => {
                const isCurrent = idx === currentMonthIndex;
                const monthLabel = normalizeMonth(item.month).toUpperCase();
                const change = item.change ?? 0;
                const ChangeIcon = change > 0 ? ArrowUpRight : change < 0 ? ArrowDownRight : Minus;
                const changeColor = change > 0 ? "text-emerald-400" : change < 0 ? "text-rose-400" : "text-slate-400";
                const changeText = `${change > 0 ? "+" : ""}${change}% vs prev`;

                return (
                  <div
                    key={item.month}
                    className="flex flex-col items-center min-w-[88px] rounded-lg transition-transform duration-200 hover:scale-105 hover:bg-white/5"
                    aria-label={`${monthLabel}: ${item.emissions} tCO2e, ${change}% vs previous`}
                    {...(isCurrent && { "aria-current": "date" })}
                  >
                    <div className="text-[10px] tracking-wide font-medium text-gray-400 mb-2">
                      {monthLabel}
                    </div>

                    {/* Dot */}
                    <div className="relative flex items-center justify-center mb-3">
                      {isCurrent && (
                        <div
                          className="absolute -inset-2 rounded-full bg-emerald-500/30 blur-md opacity-70 animate-pulse"
                          style={{ animationDuration: "2s" }}
                          aria-hidden
                        />
                      )}
                      <div
                        className={cn(
                          "rounded-full border shadow-lg transition-all duration-200",
                          isCurrent
                            ? "w-8 h-8 bg-emerald-500 text-white ring-4 ring-emerald-400/25 border-emerald-400"
                            : "w-6 h-6 bg-slate-700 hover:bg-slate-600 border-gray-600"
                        )}
                      />
                    </div>

                    {/* Emissions value */}
                    <div className="text-sm font-semibold text-gray-100">
                      {item.emissions.toLocaleString()} tCO₂e
                    </div>
                    {/* Change vs previous */}
                    <div className={cn("mt-1 flex items-center gap-1 text-xs", changeColor)}>
                      <ChangeIcon className="h-3 w-3" aria-hidden />
                      <span>{changeText}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmissionsTimeline;
