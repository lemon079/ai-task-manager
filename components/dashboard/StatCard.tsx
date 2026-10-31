import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatDotColor = "neutral" | "amber" | "emerald" | "rose";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  indicator?: StatDotColor;
  className?: string;
}

const dotStyles: Record<StatDotColor, string> = {
  neutral: "bg-muted-foreground/50",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
};

export default function StatCard({
  title,
  value,
  description,
  trend,
  indicator = "neutral",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-card p-3.5 sm:p-4 transition-colors",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <span className={cn("size-1.5 rounded-full shrink-0", dotStyles[indicator])} />
          {title}
        </span>
        {trend && (
          <span
            className={cn(
              "text-[11px] font-medium tabular-nums",
              trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}
          >
            {trend.isPositive ? "+" : "-"}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      <div className="mt-1.5">
        <div className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
          {value}
        </div>
        {description && (
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
