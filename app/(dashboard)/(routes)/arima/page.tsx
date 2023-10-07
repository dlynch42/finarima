"use client";

import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import Image from 'next/image';
import { Form, set } from "react-hook-form";
import { Heading } from "@/components/heading";
import { Download, Rocket } from "lucide-react";
import { toast } from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";  // just '@' goes to package
import { useForm, SubmitHandler, FormProvider, Controller, UseFormReturn } from "react-hook-form";
import axios from "axios";
import * as z from "zod";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { formSchema } from "./constants";
import { Loader } from "@/components/loader";
import { Empty } from "@/components/empty";
import { cn } from "@/lib/utils";
import { Card, CardFooter } from "@/components/ui/card";

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

interface Adf {
    symbol: string;
    test: string;
    date: string;
    test_stat: number;
    pvalue: number;
    lags: number;
    obs: number;
    hypothesis: string;
  }

const ArimaPage = () => {
    // Message State
    const [messages, setMessages] = useState<string[]>([]); // needs to be an array // TODO

    // Results
    const [ticker, setTicker] = useState<string | undefined>(undefined);
    const [forecast, setForecast] = useState<string | undefined>(undefined);
    const [summary, setSummary] = useState<Summary | undefined>(undefined);
    const [fd, setFd] = useState<Adf | undefined>(undefined);
    const [secd, setSecd] = useState<Adf | undefined>(undefined);
    const [sd, setSd] = useState<Adf | undefined>(undefined);
    const [sfd, setSfd] = useState<Adf | undefined>(undefined);

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
            const newMessages = [messages, userMessage];
            console.log(newMessages);

             // Create a structured request object
            const requestData = {
                messages: newMessages,
            };

            // API Post
            const response = await axios.post('http://localhost:8080/api/arima', requestData);


            // Extract the data from the response
            const responseData = response.data;

            // Set messages
            setMessages((current) => [current, userMessage, responseData.messages]);

            // Set the state variables based on the response data
            setTicker(responseData.ticker);
            setSummary(responseData.summary);
            setForecast(responseData.forecast);
            setFd(responseData.fd);
            setSecd(responseData.secd);
            setSd(responseData.sd);
            setSfd(responseData.sfd);

            form.reset(); // Reset the form

            console.log(responseData);

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
                    description="ARIMA is a forecasting model that uses past data to predict future values" // TODO
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
                                                placeholder="Enter a company's ticker or name"
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
                    <Empty label="No query started."/>
                )}
                <div className="flex flex-col-reverse gap-y-4">

                    <div className="px-4 lg:px-8 flex items-center gap-x-3 mb-8">
                        {/* <div className="p-2 w-fit rounded-md">
                        </div> */}
                        <div>
                            <h2 className="text-3xl font-bold">
                                {ticker}
                            </h2>
                            <div>
                                {/* {messages.map((forecast) => ( */}
                                    <Card 
                                        key={forecast}
                                        className="rounded-lg overflow-hidden"
                                    >
                                        <div className="relative aspect-square">
                                            {forecast && ( // Check if forecast is defined before rendering
                                                <Image 
                                                    alt="Image"
                                                    fill
                                                    src={forecast}
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
                                {/* ))} */}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {summary && (
                                    <ul>
                                        <li>Model: {summary.Model}</li>
                                        <li>Log Likelihood: {summary["Log Likelihood"]}</li>
                                        <li>Date: {summary.Date}</li>
                                        <li>AIC: {summary.AIC}</li>
                                        <li>Time: {summary.Time}</li>
                                        <li>BIC: {summary.BIC}</li>
                                        <li>Sample: {summary.Sample}</li>
                                        <li>HQIC: {summary.HQIC}</li>
                                        <li>sigma2: {summary.sigma2}</li>
                                        <li>Ljung-Box (L1) (Q): {summary["Ljung-Box (L1) (Q)"]}</li>
                                        <li>Jarque-Bera (JB): {summary["Jarque-Bera (JB)"]}</li>
                                        <li>Prob(Q): {summary["Prob(Q)"]}</li>
                                        <li>Heteroskedasticity (H): {summary["Heteroskedasticity (H)"]}</li>
                                        <li>Skew: {summary.Skew}</li>
                                        <li>Prob(H) (two-sided): {summary["Prob(H) (two-sided)"]}</li>
                                        <li>Kurtosis: {summary.Kurtosis}</li>
                                    </ul>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}

export default ArimaPage;