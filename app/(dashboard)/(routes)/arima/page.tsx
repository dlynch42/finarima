"use client";

import { Input } from "@/components/ui/input";
import { useState } from "react";
import Image from 'next/image';
import { Heading } from "@/components/heading";
import { Download, Rocket } from "lucide-react";
import { toast } from "react-hot-toast";
import { useForm, FormProvider } from "react-hook-form";
import axios from "axios";
import * as z from "zod";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { formSchema } from "./constants";
import { Loader } from "@/components/loader";
import { Empty } from "@/components/empty";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";

// Summary Inteface
interface Summary {
    Model: string;
    "Log Likelihood": string;
    Date: string;
    AIC: string;
    Time: string;
    BIC: string;
    Sample: string;
    HQIC: string;
    sigma2: string;
    "Ljung-Box (L1) (Q)": string;
    "Jarque-Bera (JB)": string;
    "Prob(Q)": string;
    "Heteroskedasticity (H)": string;
    Skew: string;
    "Prob(H) (two-sided)": string;
    Kurtosis: string;
}  

// ADF Interface
interface Adf {
    symbol: string;
    test: string;
    date: string;
    test_stat: string;
    pvalue: string;
    lags: string;
    obs: string;
    hypothesis: string;
}

// Images Interface
interface Images {
    // Timeseries plot
    timeseries: string;

    //Differencing Plot
    fd: string;
    secd: string;
    sd: string;
    sfd: string;

    // Residual Plot
    resid: string;

    // Autocorrelation Plot
    acf_fd: string;
    acf_sfd: string;
    acf_auto_sfd: string;
    pacf_sfd: string;
}

// Basics Interface
interface Basics{
    bus: string;
    ind: string;
    web: string;
    dayhigh: string;
    daylow: string;
    dayopen: string;
    dayclose: string;
    ytdhigh: string;
    ytdlow: string;
    vol: string;
}

// Arima Page
const ArimaPage = () => {
    // Message State
    const [messages, setMessages] = useState<string[]>([]);

    // Results
    const [ticker, setTicker] = useState<string>();
    const [forecast, setForecast] = useState<string>();
    const [summary, setSummary] = useState<Summary>();
    const [images, setImages] = useState<Images>();
    const [adf_fd, setAdf_fd] = useState<Adf>();
    const [adf_secd, setAdf_secd] = useState<Adf>();
    const [adf_sd, setAdf_sd] = useState<Adf>();
    const [adf_sfd, setAdf_sfd] = useState<Adf>();
    const [basics, setBasics] = useState<Basics>();

    // Router
    const router = useRouter();

    // Create form
    const form = useForm<z.infer<typeof formSchema>>({
        defaultValues: {
          company: ""
        }
    });
    
    // Loading state
    const isLoading = form.formState.isSubmitting;

    //Form submit handler
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        // Send user message (the prompt)
        try { 
            const userMessage = values.company;
            console.log(userMessage)
            const newUserMessage = [userMessage];
            
            // Create a structured request object with just the string "aapl"
            const requestData = {
                messages: userMessage,
            };
            console.log(requestData)

            // // Uncomment for Local Dev
            // const response = await axios.post(
            //     'https://localhost:8080/api/arima', 
            //     requestData
            // ); 

            // API Gateway
            const response = await axios.post(
                'https://7pvgmlb63a.execute-api.us-west-1.amazonaws.com/prod/automodel', 
                requestData
            ); 
            
            // Extract the data from the response
            const responseData = JSON.parse(response.data.body);
            console.log(responseData)

            // Post to Prisma DB
            const db = await axios.post(
                "/api/arima", 
                responseData
            );
            console.log(db.data)

            // Set messages
            setMessages((current) => [...current, ...newUserMessage]);

            // Set the state variables based on the response data
            setTicker(responseData.ticker);
            setForecast(responseData.forecast);
            setSummary(responseData.summary);
            setImages(responseData.images);
            setAdf_fd(responseData.adf_fd);
            setAdf_secd(responseData.adf_secd); 
            setAdf_sd(responseData.adf_sd);
            setAdf_sfd(responseData.adf_sfd);
            setBasics(responseData.basics);

            // form.reset(); // Reset the form
            
        } catch (error: any) {
            toast.error("Something went wrong.");
            console.error(error);
        } finally {
            // Rehydrates all server components fetching data; gets data from prisma db
            router.refresh();
        }
    };

    return (
        <div>
            <div>
                <Heading 
                    title="ARIMA"
                    description="ARIMA (AutoRegressive Integrated Moving Average) modeling is a fundamental technique in stock forecasting. 
                                It combines autoregressive, differencing, and moving average components to capture past relationships, remove trends, 
                                and account for short-term fluctuations in historical stock price data. 
                                Analysts use ARIMA models to make future price predictions by selecting appropriate orders for these components (p, d, q) and evaluating model performance. 
                                Just like any model, ARIMA has its limitations and 
                                it may not fully capture all factors influencing stock prices, necessitating the use of additional techniques and data sources for more accurate predictions"
                    icon={Rocket}
                    iconColor="text-violet-500"
                    bgColor="bg-violet-500/10"
                />
                <div className="px-4 lg:px-8">
                <FormProvider {...form}>
                    <div>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"    
                        >
                            <FormField 
                                name="company"
                                render={({ field }) => (
                                    <FormItem className="col-span-12 lg:col-span-10">
                                        <FormControl className="m-0 p-0">
                                            <Input 
                                                className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                                                disabled={isLoading}
                                                placeholder="Enter a company's ticker (e.g. AAPL for Apple, TSLA for Tesla)"
                                                {...field} 
                                            /> 
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button className="col-span-12 lg:col-span-2 w-full" disabled={isLoading}>
                                Model
                            </Button>
                        </form>
                    </div>
                </FormProvider>
            </div>
                            
            <div className="space-y-4 mt-4">
                {isLoading && (
                    <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
                        <Loader />
                    </div>
                )}

                {messages.length === 0 && !isLoading && (
                    <Empty label="Disclaimer: This data is for informational purposes only and should not be considered as financial advice. Any decisions made based on this data are at your own risk. We are not responsible for any losses or gains resulting from your actions." />
                )}

                {/* Returned */}
                {messages.length !== 0 && !isLoading && (
                    <div>
                        {/* Mandatory  */}
                        <h2 className="flex flex-col items-center text-3xl font-bold">
                            {basics && (
                                <a href={basics.web} target="_blank" rel="noopener noreferrer">
                                        {ticker}
                                </a>
                            )}
                        </h2>
                        <div className="flex flex-col-reverse gap-y-4">
                            <div className="px-4 lg:px-8 flex justify-between gap-x-3 mb-8">
                                <div className="p-2 w-fit rounded-md"></div>
                                <div className="p-2 w-fit rounded-md">
                                    {forecast && (
                                        <Card 
                                            key={forecast}
                                            className="rounded-lg overflow-hidden"
                                        >
                                            <CardHeader className="text-xl font-bold">
                                                Forecast
                                            </CardHeader>
                                            <div className="relative aspect-square">
                                                {forecast && (
                                                    <Image 
                                                        alt="Forecast"
                                                        // fill
                                                        src={forecast}
                                                        width={542}
                                                        height={542}
                                                    />
                                                )}
                                            </div>
                                            <CardFooter className="p-2">
                                                <Button 
                                                    onClick={() => window.open(forecast)}
                                                    variant="secondary" 
                                                    className="w-full"
                                                >
                                                    <Download className="h-4 w-4 mr-2"/>
                                                    Download
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    )}
                                </div>
                                <div className="p-2 w-fit rounded-md">
                                    {summary && (
                                        <div className="p-2 w-fit rounded-md items-center">
                                            <h2 className="text-xl font-bold">SARIMAX Results</h2>
                                            <table className="p-2 table-auto">
                                            <tbody>
                                                <tr>
                                                    <td>Model:</td>
                                                    <td>{summary.Model}</td>
                                                </tr>
                                                <tr>
                                                    <td>Log Likelihood:</td>
                                                    <td>{summary["Log Likelihood"]}</td>
                                                </tr>
                                                <tr>
                                                    <td>AIC:</td>
                                                    <td>{summary.AIC}</td>
                                                </tr>
                                                <tr>
                                                    <td>BIC:</td>
                                                    <td>{summary.BIC}</td>
                                                </tr>
                                                <tr>
                                                    <td>Sample:</td>
                                                    <td>{summary.Sample}</td>
                                                </tr>
                                                <tr>
                                                    <td>HQIC:</td>
                                                    <td>{summary.HQIC}</td>
                                                </tr>
                                                <tr>
                                                    <td>sigma2:</td>
                                                    <td>{summary.sigma2}</td>
                                                </tr>
                                                <tr>
                                                    <td>Ljung-Box (L1) (Q):</td>
                                                    <td>{summary["Ljung-Box (L1) (Q)"]}</td>
                                                </tr>
                                                <tr>
                                                    <td>Jarque-Bera (JB):</td>
                                                    <td>{summary["Jarque-Bera (JB)"]}</td>
                                                </tr>
                                                <tr>
                                                    <td>Prob(Q):</td>
                                                    <td>{summary["Prob(Q)"]}</td>
                                                </tr>
                                                <tr>
                                                    <td>Heteroskedasticity (H): </td>
                                                    <td>{summary["Heteroskedasticity (H)"]}</td>
                                                </tr>
                                                <tr>
                                                    <td>Skew:</td>
                                                    <td>{summary.Skew}</td>
                                                </tr>
                                                <tr>
                                                    <td>Prob(H) (two-sided):</td>
                                                    <td>{summary["Prob(H) (two-sided)"]}</td>
                                                </tr>
                                                <tr>
                                                    <td>Kurtosis:</td>
                                                    <td>{summary.Kurtosis}</td>
                                                </tr>
                                            </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                                <div className="p-2 w-fit rounded-md">
                                    {basics && (
                                        <div className="p-2 w-fit rounded-md">
                                            <h2 className="text-xl font-bold">
                                                        About
                                            </h2>
                                            <p className="p-2 text-sm text-muted-foreground">
                                            <ul>
                                                <li>Industry: {basics.ind}</li>
                                                <li>Day High: {basics.dayhigh}</li>
                                                <li>Day Low: {basics.daylow}</li>
                                                <li>Day Open: {basics.dayopen}</li>
                                                <li>Day Close: {basics.dayclose}</li>
                                                <li>YTD High: {basics.ytdhigh}</li>
                                                <li>YTD Low: {basics.ytdlow}</li>
                                                <li>Volume: {basics.vol}</li>
                                            </ul>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ADF */}
                        <h2 className="flex flex-col items-center text-3xl font-bold">
                                Augmented Dickey-Fuller Tests
                        </h2>
                        <div className="flex flex-col-reverse gap-y-4">
                            <div className="px-4 lg:px-8 flex items-center gap-x-3 mb-8">
                                <div className="p-2 w-fit rounded-md"></div>
                                <div className="p-2 w-fit rounded-md">
                                    {adf_fd && (
                                        <div>
                                        <h2 className="text-xl font-bold">
                                            First Difference
                                        </h2>
                                        <p className="p-2 text-sm text-muted-foreground">
                                            <ul>
                                                <li>Test: {adf_fd.test}</li>
                                                <li>Date: {adf_fd.date}</li>
                                                <li>Test Stat: {adf_fd.test_stat}</li>
                                                <li>P-value: {adf_fd.pvalue}</li>
                                                <li>Lags: {adf_fd.lags}</li>
                                                <li>Observations: {adf_fd.obs}</li>
                                                <li>Hypothesis: {adf_fd.hypothesis}</li>
                                            </ul>
                                        </p>
                                    </div>
                                    )}
                                    {images && (
                                        <Card 
                                            key={images.fd}
                                            className="rounded-lg overflow-hidden"
                                        >
                                            <CardHeader className="text-xl font-bold">
                                                First Difference
                                            </CardHeader>
                                            <div className="relative aspect-square">
                                                {images.fd && (
                                                    <Image 
                                                        alt="First Difference"
                                                        fill
                                                        src={images.fd}
                                                    />
                                                )}
                                            </div>
                                            <CardFooter className="p-2">
                                                <Button 
                                                    onClick={() => window.open(images.fd)}
                                                    variant="secondary" 
                                                    className="w-full"
                                                >
                                                    <Download className="h-4 w-4 mr-2"/>
                                                    Download
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    )}
                                </div> 

                                {/* Second Difference */}
                                <div className="p-2 w-fit rounded-md">
                                    {adf_secd && (
                                        <div>
                                        <h2 className="text-xl font-bold">
                                            Second Difference
                                        </h2>
                                        <p className="p-2 text-sm text-muted-foreground">
                                            <ul>
                                                <li>Test: {adf_secd.test}</li>
                                                <li>Date: {adf_secd.date}</li>
                                                <li>Test Stat: {adf_secd.test_stat}</li>
                                                <li>P-value: {adf_secd.pvalue}</li>
                                                <li>Lags: {adf_secd.lags}</li>
                                                <li>Observations: {adf_secd.obs}</li>
                                                <li>Hypothesis: {adf_secd.hypothesis}</li>
                                            </ul>
                                        </p>
                                    </div>
                                    )}
                                    {images && (
                                        <Card 
                                            key={images.secd}
                                            className="rounded-lg overflow-hidden"
                                        >
                                            <CardHeader className="text-xl font-bold">
                                                Second Difference
                                            </CardHeader>
                                            <div className="relative aspect-square">
                                                {images.secd && (
                                                    <Image 
                                                        alt="Second Difference"
                                                        fill
                                                        src={images.secd}
                                                    />
                                                )}
                                            </div>
                                            <CardFooter className="p-2">
                                                <Button 
                                                    onClick={() => window.open(images.secd)}
                                                    variant="secondary" 
                                                    className="w-full"
                                                >
                                                    <Download className="h-4 w-4 mr-2"/>
                                                    Download
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    )}
                                </div>

                                {/* Seasonal Difference */}
                                <div className="p-2 w-fit rounded-md">
                                    {adf_sd && (
                                        <div>
                                        <h2 className="text-xl font-bold">
                                            Seasonal Difference
                                        </h2>
                                        <p className="p-2 text-sm text-muted-foreground">
                                            <ul>
                                                <li>Test: {adf_sd.test}</li>
                                                <li>Date: {adf_sd.date}</li>
                                                <li>Test Stat: {adf_sd.test_stat}</li>
                                                <li>P-value: {adf_sd.pvalue}</li>
                                                <li>Lags: {adf_sd.lags}</li>
                                                <li>Observations: {adf_sd.obs}</li>
                                                <li>Hypothesis: {adf_sd.hypothesis}</li>
                                            </ul>
                                        </p>
                                    </div>
                                    )}
                                    {images && (
                                        <Card 
                                            key={images.sd}
                                            className="rounded-lg overflow-hidden"
                                        >
                                            <CardHeader className="text-xl font-bold">
                                                Seasonal Difference
                                            </CardHeader>
                                            <div className="relative aspect-square">
                                                {images.sd && (
                                                    <Image 
                                                        alt="Seasonal Difference"
                                                        fill
                                                        src={images.sd}
                                                    />
                                                )}
                                            </div>
                                            <CardFooter className="p-2">
                                                <Button 
                                                    onClick={() => window.open(images.sd)}
                                                    variant="secondary" 
                                                    className="w-full"
                                                >
                                                    <Download className="h-4 w-4 mr-2"/>
                                                    Download
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    )}
                                </div>

                                {/* Seasonal First Difference */}
                                <div className="p-2 w-fit rounded-md">
                                    {adf_sfd && (
                                        <div>
                                        <h2 className="text-xl font-bold">
                                            Seasonal First Difference
                                        </h2>
                                        <p className="p-2 text-sm text-muted-foreground">
                                            <ul>
                                                <li>Test: {adf_sfd.test}</li>
                                                <li>Date: {adf_sfd.date}</li>
                                                <li>Test Stat: {adf_sfd.test_stat}</li>
                                                <li>P-value: {adf_sfd.pvalue}</li>
                                                <li>Lags: {adf_sfd.lags}</li>
                                                <li>Observations: {adf_sfd.obs}</li>
                                                <li>Hypothesis: {adf_sfd.hypothesis}</li>
                                            </ul>
                                        </p>
                                    </div>
                                    )}
                                    {images && (
                                        <Card 
                                            key={images.sfd}
                                            className="rounded-lg overflow-hidden"
                                        >
                                            <CardHeader className="text-xl font-bold">
                                            Seasonal First Difference
                                            </CardHeader>
                                            <div className="relative aspect-square">
                                                {images.sfd && (
                                                    <Image 
                                                        alt="Seasonal First Difference"
                                                        fill
                                                        src={images.sfd}
                                                    />
                                                )}
                                            </div>
                                            <CardFooter className="p-2">
                                                <Button 
                                                    onClick={() => window.open(images.sfd)}
                                                    variant="secondary" 
                                                    className="w-full"
                                                >
                                                    <Download className="h-4 w-4 mr-2"/>
                                                    Download
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Autocorrelation */}
                        <h2 className="flex flex-col items-center text-3xl font-bold">
                                Autocorrelations, Timeseries, and Residual
                        </h2>
                        <div className="flex flex-col-reverse gap-y-4">
                            <div className="px-4 lg:px-8 flex items-center gap-x-3 mb-8">
                                <div className="p-2 w-fit rounded-md"></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:gird-cols-4 gap-4 mt-8">
                                    <div className="p-2 w-fit rounded-md">
                                        {images && (
                                            <div>
                                                <Card 
                                                    key={images.acf_fd}
                                                    className="rounded-lg overflow-hidden"
                                                >
                                                    <CardHeader className="text-xl font-bold">
                                                    First Difference
                                                    </CardHeader>
                                                    <div className="relative aspect-square">
                                                        {images.acf_fd && (
                                                            <Image 
                                                                alt="First Difference"
                                                                width={542}
                                                                height={542}
                                                                src={images.acf_fd}
                                                            />
                                                        )}
                                                    </div>
                                                    <CardFooter className="p-2">
                                                        <Button 
                                                            onClick={() => window.open(images.acf_fd)}
                                                            variant="secondary" 
                                                            className="w-full"
                                                        >
                                                            <Download className="h-4 w-4 mr-2"/>
                                                            Download
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2 w-fit rounded-md">
                                        {images && (
                                            <div>
                                                {/* Autocorrelation (Seasonal First Difference) */}
                                                <Card 
                                                    key={images.acf_sfd}
                                                    className="rounded-lg overflow-hidden"
                                                >
                                                    <CardHeader className="text-xl font-bold">
                                                        Seasonal First Difference
                                                    </CardHeader>
                                                    <div className="relative aspect-square">
                                                        {images.acf_sfd && (
                                                            <Image 
                                                                alt="Seasonal First Difference"
                                                                width={542}
                                                                height={542}
                                                                src={images.acf_sfd}
                                                            />
                                                        )}
                                                    </div>
                                                    <CardFooter className="p-2">
                                                        <Button 
                                                            onClick={() => window.open(images.acf_sfd)}
                                                            variant="secondary" 
                                                            className="w-full"
                                                        >
                                                            <Download className="h-4 w-4 mr-2"/>
                                                            Download
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2 w-fit rounded-md">
                                        {images && (
                                        <div>
                                            {/* Seasonal First Difference - Autocorrelation */}
                                            <Card 
                                                key={images.acf_auto_sfd}
                                                className="rounded-lg overflow-hidden"
                                            >
                                                <CardHeader className="text-xl font-bold">
                                                    Seasonal First Difference (Autocorrelation)
                                                </CardHeader>
                                                <div className="relative aspect-square">
                                                    {images.acf_auto_sfd && (
                                                        <Image 
                                                            alt="Seasonal First Difference (Autocorrelation)"
                                                            width={542}
                                                            height={542}
                                                            src={images.acf_auto_sfd}
                                                        />
                                                    )}
                                                </div>
                                                <CardFooter className="p-2">
                                                    <Button 
                                                        onClick={() => window.open(images.acf_auto_sfd)}
                                                        variant="secondary" 
                                                        className="w-full"
                                                    >
                                                        <Download className="h-4 w-4 mr-2"/>
                                                        Download
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        </div>
                                        )}
                                    </div>
                                    <div className="p-2 w-fit rounded-md">
                                        {images && (
                                            <div>
                                                {/* Partial Autocorrelation (First Difference) */}
                                                <Card 
                                                    key={images.pacf_sfd}
                                                    className="rounded-lg overflow-hidden"
                                                >
                                                    <CardHeader className="text-xl font-bold">
                                                        Partial Autocorrelation (First Difference)
                                                    </CardHeader>
                                                    <div className="relative aspect-square">
                                                        {images.pacf_sfd && (
                                                            <Image 
                                                                alt="Partial Autocorrelation (First Difference)"
                                                                width={542}
                                                                height={542}
                                                                src={images.pacf_sfd}
                                                            />
                                                        )}
                                                    </div>
                                                    <CardFooter className="p-2">
                                                        <Button 
                                                            onClick={() => window.open(images.pacf_sfd)}
                                                            variant="secondary" 
                                                            className="w-full"
                                                        >
                                                            <Download className="h-4 w-4 mr-2"/>
                                                            Download
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2 w-fit rounded-md">
                                        {images && (
                                            <div >
                                                <Card 
                                                    key={images.timeseries}
                                                    className="rounded-lg overflow-hidden"
                                                >
                                                    <CardHeader className="text-xl font-bold">
                                                        Time Series
                                                    </CardHeader>
                                                    <div className="relative aspect-square">
                                                        {images.timeseries && (
                                                            <Image 
                                                                alt="Timeseries"
                                                                src={images.timeseries}
                                                                width={542}
                                                                height={542}
                                                            />
                                                        )}
                                                    </div>
                                                    <CardFooter className="p-2">
                                                        <Button 
                                                            onClick={() => window.open(images.timeseries)}
                                                            variant="secondary" 
                                                            className="w-full"
                                                        >
                                                            <Download className="h-4 w-4 mr-2"/>
                                                            Download
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2 w-fit rounded-md">
                                        {images && (
                                            <div>
                                                <Card 
                                                    key={images.resid}
                                                    className="rounded-lg overflow-hidden"
                                                >
                                                    <CardHeader className="text-xl font-bold">
                                                    Residual
                                                    </CardHeader>
                                                    <div className="relative aspect-square">
                                                        {images.resid && (
                                                            <Image 
                                                                alt="Timeseries"
                                                                src={images.resid}
                                                                width={542}
                                                                height={542}
                                                            />
                                                        )}
                                                    </div>
                                                    <CardFooter className="p-2">
                                                        <Button 
                                                            onClick={() => window.open(images.resid)}
                                                            variant="secondary" 
                                                            className="w-full"
                                                        >
                                                            <Download className="h-4 w-4 mr-2"/>
                                                            Download
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Co. Description */}
                        <div className="flex flex-col-reverse gap-y-4">
                            <div className="px-4 lg:px-8 flex items-center gap-x-3 mb-8">
                                <div className="p-2 w-fit rounded-md"></div>
                                    <div className="p-2 w-fit rounded-md">
                                        {basics && (
                                            <div className="p-2 w-fit rounded-md flex flex-col items-center text-xl">
                                                <p className="flex flex-col items-center p-2 text-sm text-muted-foreground">
                                                <ul>
                                                    <li>{basics.bus}</li>
                                                </ul>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                            </div>
                        </div>
                        {/* Disclaimer */}
                        <div className="flex flex-col-reverse gap-y-4">
                            <div className="px-4 lg:px-8 flex items-center gap-x-3 mb-8">
                                <div className="p-2 w-fit rounded-md"></div>
                                    <div className="p-2 w-fit rounded-md">
                                        {basics && (
                                            <div className="p-2 w-fit rounded-md flex flex-col items-center text-xl">
                                                <p className="flex flex-col items-center p-2 text-sm text-muted-foreground">
                                                Disclaimer: This data is for informational purposes only and should not be considered as financial advice. Any decisions made based on this data are at your own risk. We are not responsible for any losses or gains resulting from your actions.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
    );
}

export default ArimaPage; 