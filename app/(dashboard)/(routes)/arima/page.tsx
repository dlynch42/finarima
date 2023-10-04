"use client";

import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { set } from "react-hook-form";

const ArimaPage = () => {

    // const [message, setMessage] = useState("Loading"); // get message
    // const [people, setPeople] = useState([]); // get people

    const [ticker, setTicker] = useState<string>(); // ("Loading...") get ticker
    const [forecast, setForecast] = useState(); // get forecast
    const [summary, setSummary] = useState(); // get summary
    const [adf, setAdf] = useState(); // get adf


    useEffect(() => {
        fetch('http://localhost:8080/api/arima')
        .then((response => response.json()))
        .then((data) => {
            // message = 'loading'
            // once data is returned, 
            // set message to data.message
            // setMessage(data.message);
            setTicker(data.ticker);
            setSummary(data.summary);
            // setForecast(data.plot_forecast);
            setAdf(data.adf);
            // console.log(data.people);
        });
    }, []);

    return (
        <div>
            <div>
                Input
                {/* <Input /> */}
            </div>
            <div>
                Results
                <div>{ticker}</div>
                <div>{/* <img src="{{ plot }}" alt='Forecast Plot' /> */}</div>
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