import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const finmodels =[
    {
        name: "Moving Averages",
        description: `Moving Averages smooth historical data to identify trends and patterns in stock prices`
    },
    {
        name: "AutoRegressive Integrated Moving Average (ARIMA)",
        description: `ARIMA predicts future values of financial time series based on historical data patterns.`
    },
    {
        name: "Generalized Autoregressive Conditional Heteroskedasticity (GARCH)",
        description: `GARCH models capture volatility clustering and conditional heteroskedasticity in stock returns`
    },
    {
        name: "Adaptive Smoothing",
        description: `Adaptive Smoothing models adjust data smoothing parameters to adapt to changing volatility in financial data.`
    }
]

export const LandingContent = () => {
    return (
        <div className="px-10 pb-20">
            <h2 className="text-center text-4xl text-white font-extrabold mb-10">
                Financial Models
            </h2>
            <p className="text-center text-xl text-zinc-400 mb-10">
                More background on Quantitative Analysis at <a 
                            href="https://www.investopedia.com/articles/investing/041114/simple-overview-quantitative-analysis.asp" 
                            target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white" > 
                            Investopedia </a>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {finmodels.map((item) => (
                    <Card key={item.description} className="bg-[#192339] border-none text-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-x-2">
                                <div>
                                    <p className="text-lg">{item.name}</p>
                                </div>
                            </CardTitle>
                            <CardContent className="pt-4 px-0">
                                {item.description}
                            </CardContent>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>
    )
};