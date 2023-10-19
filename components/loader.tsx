import { RotateCw } from 'lucide-react';

export const Loader = () => {
    return (
        <div className="h-full flex flex-col gap-y-4 items-center justify-center text-sm text-muted-foreground">
            Your content may take up to 20 seconds to load
            <div className="w-10 h-10 relative animate-spin">
                <RotateCw className="h-10 w-10 bg[#111827]"/>
            </div>
        </div>
    );
};