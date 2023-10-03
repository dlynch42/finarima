import Image from "next/image";

//TODO: Change the loader to something more related to stocks
export const Loader = () => {
    return (
        <div className="h-full flex flex-col gap-y-4 items-center justify-center">
            <div className="w-10 h-10 relative animate-spin">
                <Image 
                    alt="logo"
                    fill
                    src="/logo.png"
                />
            </div>
            <p className="test-sm text-muted-foreground">
                Genius is thinking...
            </p>
        </div>
    );
};