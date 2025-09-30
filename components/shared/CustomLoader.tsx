import { Loader2 } from 'lucide-react';
import React from 'react'

type CustomLoaderProps = {
    size?: number;       // controls height & width
    color?: string;      // tailwind color classes (e.g. "text-blue-500")
    fullScreen?: boolean; // whether to center in full screen
};

const CustomLoader = ({
    size = 24,
    color = "text-blue-400",
    fullScreen = false,
}: CustomLoaderProps) => {
    const loader = (
        <Loader2
            className={`animate-spin ${color}`}
            style={{ width: size, height: size }}
        />
    );

    if (fullScreen) {
        return (
            <div className="flex justify-center items-center h-screen">
                {loader}
            </div>
        );
    }

    return <div className="flex items-center justify-center">{loader}</div>;
}

export default CustomLoader
