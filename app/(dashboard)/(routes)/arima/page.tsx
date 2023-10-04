"use client";

import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import Image from 'next/image';
import { set } from "react-hook-form";

const ArimaPage = () => {

    const [ticker, setTicker] = useState<string>(); // ("Loading...") get ticker
    const [forecast, setForecast] = useState(); // get forecast
    const [summary, setSummary] = useState(); // get summary
    const [adf, setAdf] = useState(); // get adf


    useEffect(() => {
        fetch('http://localhost:8080/api/arima')
        .then((response => response.json()))
        .then((data) => {
            setTicker(data.ticker);
            setSummary(data.summary);
            setForecast(data.forecast);
            setAdf(data.adf);
        });
    }, []);

    return (
        <div>
            <div>
                <h1>ARIMA</h1>
                <p>ARIMA is a forecasting model that uses past data to predict future values.</p>
            </div>
            <div>
                Input
                <Input />
            </div>
            <div>
                Results
                <div>{ticker}</div>
                <div>
                    {/* const escapedForecast = forecast?.replace(/'/g, '&apos;'); */}
                    <Image src={forecast?.url} alt='Forecast Plot' width={forecast?.width} height={forecast?.height} />
                </div>
                <div>{summary}</div>
                <div>{adf}</div>
            </div>

        </div>
    )
}

export default ArimaPage;

    // TODO: Create an input component with options like forecast length (with an upper limit), confidence interval, etc.
    // TODO: Send text input to API
    // TODO: Display results