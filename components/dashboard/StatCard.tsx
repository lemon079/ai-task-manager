import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

export default function StatCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    className,
}: StatCardProps) {
    return (
        <div className={cn("stat-card", className)}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
                    {description && (
                        <p className="text-sm text-muted-foreground mt-1">{description}</p>
                    )}
                    {trend && (
                        <div className="flex items-center gap-1 mt-2">
                            <span
                                className={cn(
                                    "text-sm font-medium",
                                    trend.isPositive ? "text-green-600" : "text-red-600"
                                )}
                            >
                                {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
                            </span>
                            <span className="text-xs text-muted-foreground">vs last week</span>
                        </div>
                    )}
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                </div>
            </div>
        </div>
    );
}
