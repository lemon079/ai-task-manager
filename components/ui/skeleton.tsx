import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Make the skeleton animate
     * @default true
     */
    animate?: boolean;
}

/**
 * Skeleton component for loading states
 * Use to indicate content is loading
 */
function Skeleton({ className, animate = true, ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                "rounded-md bg-muted",
                animate && "animate-pulse",
                className
            )}
            {...props}
        />
    );
}

/**
 * Pre-built skeleton variants for common use cases
 */
const SkeletonText = ({
    lines = 1,
    className
}: {
    lines?: number;
    className?: string;
}) => (
    <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
                key={i}
                className={cn(
                    "h-4",
                    i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
                )}
            />
        ))}
    </div>
);

const SkeletonAvatar = ({
    size = "md",
    className
}: {
    size?: "sm" | "md" | "lg";
    className?: string;
}) => {
    const sizeClasses = {
        sm: "size-8",
        md: "size-10",
        lg: "size-12",
    };

    return (
        <Skeleton
            className={cn("rounded-full", sizeClasses[size], className)}
        />
    );
};

const SkeletonButton = ({
    className
}: {
    className?: string;
}) => (
    <Skeleton className={cn("h-10 w-24 rounded-md", className)} />
);

const SkeletonCard = ({
    className
}: {
    className?: string;
}) => (
    <div className={cn("rounded-lg border bg-card p-6", className)}>
        <div className="flex items-center space-x-4">
            <SkeletonAvatar />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
            </div>
        </div>
        <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
        </div>
    </div>
);

export {
    Skeleton,
    SkeletonText,
    SkeletonAvatar,
    SkeletonButton,
    SkeletonCard
};
