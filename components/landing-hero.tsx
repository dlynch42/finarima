import Link from "next/link";
import TypewriterComponent from 'typewriter-effect';
import { Button } from "./ui/button";

export const LandingHero = () => {
    return (
        <div className="text-white font-bold py-36 text-center space-y-5">
            <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl space-y-5 font-extrabold">
                <h1>The Best Tool for Financial Modeling</h1>
                <div className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    {/* <TypewriterComponent
                        options={{
                            strings: [
                                "Autoregressive Integrated Moving Average (ARIMA).",
                                "Adaptive smoothing.",
                                "Kalman Filtering.",
                                "Simple Moving Averages.",
                            ],
                            autoStart: true,
                            loop: true,
                        }}
                    /> */}
                </div>
                
            </div>
            <div className="text-sm md:text-xl font-light text-zinc-400">
                Use an ARIMA Model to analyze your stock of choice.
            </div>
            <div className="text-sm md:text-xl font-light text-zinc-400">
                More models coming soon!
            </div>
            <div>
                <Link href="/home">
                    <Button variant="dark" className="md:text-lg p-4 md:p-6 rounded-full font-semibold">
                        Start Modeling
                    </Button>
                </Link>
            </div> 
        </div>
    )
};