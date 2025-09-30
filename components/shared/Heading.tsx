import { cn } from "@/lib/utils";
import React from "react";

interface HeadingProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    className?: React.ReactNode;
}

const Heading: React.FC<HeadingProps> = ({ title, subtitle, icon, className }) => {
    return (
        <>
            <div className={cn("flex items-center gap-2", className)}>
                {icon && <span className="text-2xl">{icon}</span>}
                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            </div>
            {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </>
    );
};

export default Heading;
