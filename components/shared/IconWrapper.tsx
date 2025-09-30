import React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface IconWrapperProps {
  icon: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>;
  size?: number;
  className?: string;
}

export default function IconWrapper({ icon: Icon, size = 24, className }: IconWrapperProps) {
  if (!Icon) return null;

  return (
    <Icon
      size={size}
      className={cn("inline-block", className)}
      aria-hidden="true"
    />
  );
}
