import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TaskSkeletonProps {
    count?: number;
    className?: string;
}

/**
 * Skeleton loader for task list items
 */
export function TaskSkeleton({ count = 3, className }: TaskSkeletonProps) {
    return (
        <div className={cn("space-y-3", className)}>
            {Array.from({ length: count }).map((_, i) => (
                <TaskItemSkeleton key={i} />
            ))}
        </div>
    );
}

/**
 * Single task item skeleton
 */
export function TaskItemSkeleton() {
    return (
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-4 flex-1">
                {/* Checkbox placeholder */}
                <Skeleton className="h-5 w-5 rounded" />

                {/* Task content */}
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>
            </div>

            {/* Priority badge */}
            <Skeleton className="h-6 w-16 rounded-full" />
        </div>
    );
}

/**
 * Skeleton for task details/modal
 */
export function TaskDetailSkeleton() {
    return (
        <div className="space-y-6 p-6">
            {/* Title */}
            <Skeleton className="h-8 w-2/3" />

            {/* Description */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
            </div>

            {/* Meta info */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-6 w-20" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-6 w-24" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-6 w-28" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-6 w-20" />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
    );
}

/**
 * Skeleton for task table rows
 */
export function TaskTableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="rounded-md border">
            {/* Table header */}
            <div className="flex items-center gap-4 p-4 border-b bg-muted/50">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/6" />
                <Skeleton className="h-4 w-1/6" />
                <Skeleton className="h-4 w-1/6" />
            </div>

            {/* Table rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-b last:border-0">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                </div>
            ))}
        </div>
    );
}
