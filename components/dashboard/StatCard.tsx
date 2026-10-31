import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatVariant = "indigo" | "amber" | "emerald" | "rose";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: StatVariant;
  className?: string;
}

const variantStyles: Record<
  StatVariant,
  {
    border: string;
    bgGradient: string;
    iconBg: string;
    iconColor: string;
    indicator: string;
  }
> = {
  indigo: {
    border: "border-indigo-500/25 dark:border-indigo-500/20 hover:border-indigo-500/50",
    bgGradient: "from-card via-card to-indigo-500/5 dark:to-indigo-500/10",
    iconBg: "bg-indigo-500/10 dark:bg-indigo-500/20 ring-1 ring-indigo-500/20",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    indicator: "bg-indigo-500",
  },
  amber: {
    border: "border-amber-500/25 dark:border-amber-500/20 hover:border-amber-500/50",
    bgGradient: "from-card via-card to-amber-500/5 dark:to-amber-500/10",
    iconBg: "bg-amber-500/10 dark:bg-amber-500/20 ring-1 ring-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
    indicator: "bg-amber-500",
  },
  emerald: {
    border: "border-emerald-500/25 dark:border-emerald-500/20 hover:border-emerald-500/50",
    bgGradient: "from-card via-card to-emerald-500/5 dark:to-emerald-500/10",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20 ring-1 ring-emerald-500/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    indicator: "bg-emerald-500",
  },
  rose: {
    border: "border-rose-500/25 dark:border-rose-500/20 hover:border-rose-500/50",
    bgGradient: "from-card via-card to-rose-500/5 dark:to-rose-500/10",
    iconBg: "bg-rose-500/10 dark:bg-rose-500/20 ring-1 ring-rose-500/20",
    iconColor: "text-rose-600 dark:text-rose-400",
    indicator: "bg-rose-500",
  },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = "indigo",
  className,
}: StatCardProps) {
  const styles = variantStyles[variant] || variantStyles.indigo;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 border bg-gradient-to-br transition-all duration-300",
        "shadow-xs hover:shadow-md hover:-translate-y-0.5 group",
        styles.border,
        styles.bgGradient,
        className
      )}
    >
      {/* Top Accent Indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1 transition-opacity opacity-75 group-hover:opacity-100",
          styles.indicator
        )}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="text-3xl font-extrabold text-foreground mt-2 tracking-tight tabular-nums">
            {value}
          </p>

          {description && (
            <p className="text-xs text-muted-foreground mt-1.5 font-medium truncate">
              {description}
            </p>
          )}

          {trend && (
            <div className="flex items-center gap-1.5 mt-2.5">
              <span
                className={cn(
                  "text-xs font-semibold px-1.5 py-0.5 rounded-md",
                  trend.isPositive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                )}
              >
                {trend.isPositive ? "+" : "-"}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                vs last week
              </span>
            </div>
          )}
        </div>

        {/* Icon Container with Subtle Ring */}
        <div
          className={cn(
            "size-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105",
            styles.iconBg
          )}
        >
          <Icon className={cn("size-6", styles.iconColor)} />
        </div>
      </div>
    </div>
  );
}
