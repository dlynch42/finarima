"use client";

import Image from "next/image";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import {
    Home,
    CandlestickChart,
    Rocket,
    Settings,
} from "lucide-react"; //https://lucide.dev/icons

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation"; 

// Side Bar Font
const montserrat = Montserrat({ 
    weight: "600", 
    subsets: ["latin"]
});

// Side Bar Routes
const routes = [
    {
        label: "Home",
        icon: Home,
        href: "/home",
        color: "text-sky-500",
    },
    {
        label: "ARIMA",
        icon: Rocket,
        href: "/arima",
        color: "text-violet-500",
    },
    {
        label: "Moving Average",
        icon: Rocket,
        href: "/ma",
        color: "text-red-400",
    },
    {
        label: "GARCH",
        icon: Rocket,
        href: "/garch",
        color: "text-green-300",
    },
    {
        label: "Adaptive Smoothing",
        icon: Rocket,
        href: "/adapative",
        color: "text-yellow-300",
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/settings"
    }
];

interface SidebarProps {
    apiLimitCount: number;
    isPro: boolean;
};

const Sidebar = () => {
    // Create pathname
    const pathname = usePathname();

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg[#111827] text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-2"> 
                        {/* <Image 
                            fill
                            alt="Logo"
                            src="/logo.png"
                        /> */}
                        <CandlestickChart size={24} color="orange" />
                    </div>
                    <h1 className={cn("text-2xl font-bold", montserrat.className)}>
                        AutoModel
                    </h1>
                </Link>
                <div className="space-y-1"> {/* Space between links; want it even */}
                    {routes.map((route) => (
                    <Link 
                        href={route.href}
                        key={route.href}
                        className={cn("text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition", 
                                    pathname === route.href ? "text-white bg-white/10" : "text-zinc-400" // dynamic programming; highlights the page we're on
                                    )} 
                    >
                        <div className="flex items-center flex-1">
                            <route.icon className={cn("h-5 w-5 mr-3", route.color)} /> 
                            {route.label}
                        </div>
                    </Link>
                    ))}           
                </div>
            </div>
        </div>
    );
}

export default Sidebar;