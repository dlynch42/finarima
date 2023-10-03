"use client";

import { ArrowRight, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const tools = [
    {
        label: "ARIMA",
        icon: Rocket,
        // color: "text-violet-500",
        // bgColor: "bg-violet-500/10",
        color: "orange",
        bgColor: "bg-orange/10",
        href: "/arima",
    },
    {
        label: "Moving Average (Coming Soon!)",
        icon: Rocket,
        // color: "text-violet-500",
        // bgColor: "bg-violet-500/10",
        color: "orange",
        bgColor: "bg-orange/10",
        href: "/ma",
    },
    {
        label: "GARCH (Coming Soon!)",
        icon: Rocket,
        // color: "text-violet-500",
        // bgColor: "bg-violet-500/10",
        color: "orange",
        bgColor: "bg-orange/10",
        href: "/garch",
    },
    {
        label: "Adaptive Smoothing (Coming Soon!)",
        icon: Rocket,
        // color: "text-violet-500",
        // bgColor: "bg-violet-500/10",
        color: "orange",
        bgColor: "bg-orange/10",
        href: "/adaptive",
    },
]

const HomePage = () => {
  const router = useRouter();

  return (
    <div>
      <div className="mb-8 space-y-4">
        <h2 className="test-2xl md:text-4xl font-bold text-center">
          Explore the Power of Financial Modeling
        </h2>
        <p className="text-muted-foreground font-light text-sm md:text-lg text-center">
          First choose a model and then enter a stock symbol to get started.
        </p>
        <div className="px-4 md:px-20 lg:px-32 space-y-4">
          {tools.map((tool) => (
            <Card 
              onClick={ () => router.push(tool.href) }
              key={tool.href}
              className="p-4 border-black/5 flex items-center justify-between hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-center gap-x-4">
                <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
                  <tool.icon className={cn(tool.color, "w-8 h-8", tool.color)} />
                </div>
                <div className="font-semibold">
                  {tool.label}
                </div>
              </div>
              <ArrowRight className="w-5 h-5" />
            </Card>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default HomePage;