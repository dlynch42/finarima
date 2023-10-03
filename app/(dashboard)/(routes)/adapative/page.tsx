import { HardHat } from "lucide-react";

const AdaptiveSmoothingPage = () => {
    return (
        <div className="h-screen flex justify-center items-center">
            <div className="w-full h-full grid grid-cols-3 gap-4 content-center">
                <div className="flex flex-col justify-center items-center">
                </div>
                <div className="flex flex-col justify-center items-center justify-self-center">
                    <div className="mt-auto mb-auto">
                        <h1 className="text-center">
                            <HardHat size={100}/>
                        </h1>
                        <h1 className="text-center">
                            Coming Soon!
                        </h1>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdaptiveSmoothingPage;