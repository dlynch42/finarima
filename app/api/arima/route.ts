import { NextResponse } from 'next/server';
import axios from 'axios';
// import { } from "react";
import prismadb from "@/lib/prismadb";

// Summary Inteface
interface Summary {
    Model: string;
    "Log Likelihood": number;
    Date: string;
    AIC: number;
    Time: string;
    BIC: number;
    Sample: number;
    HQIC: number;
    sigma2: number;
    "Ljung-Box (L1) (Q)": number;
    "Jarque-Bera (JB)": number;
    "Prob(Q)": number;
    "Heteroskedasticity (H)": number;
    Skew: number;
    "Prob(H) (two-sided)": number;
    Kurtosis: number;
}  

// ADF Interface
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

// Generate a response from API
export async function POST(
    req: Request
) { 
    const body = await req.json();
    const { message } = body;
    
    try {
        const response = await axios.post(
            'https://7pvgmlb63a.execute-api.us-west-1.amazonaws.com/prod/automodel', 
            message
        ); 

        // Extract the data from the response
        const responseData = JSON.parse(response.data.body);
        
        // Results
        const ticker: string = responseData.ticker;
        const summary:  Summary = responseData.summary;
        const adf_fd: Adf = responseData.adf_fd;
        const adf_secd: Adf = responseData.adf_secd;
        const adf_sd: Adf = responseData.adf_sd;
        const adf_sfd: Adf = responseData.adf_sfd;

        // Load into Prisma
        const dbPromises = [
            // Load Summary data to Prisma
            await prismadb.stats.create({
                data: {
                    symbol: ticker,
                    date: summary.Date,
                    model: summary.Model,
                    log_likelihood: summary["Log Likelihood"],
                    aic: summary.AIC,
                    bic: summary.BIC,
                    sample: summary.Sample,
                    hqic: summary.HQIC,
                    sigma2: summary.sigma2,
                    ljung_box: summary["Ljung-Box (L1) (Q)"],
                    jarque_bera: summary["Jarque-Bera (JB)"],
                    prob_q: summary["Prob(Q)"],
                    h: summary["Heteroskedasticity (H)"],
                    skew: summary.Skew,
                    prob_h: summary["Prob(H) (two-sided)"],
                    kurtosis: summary.Kurtosis,                    
                },
            }),

            // Load ADF First Difference Data to Prisma
            await prismadb.adf.create({
                data: {
                    symbol: ticker,
                    test: adf_fd.test,
                    date: adf_fd.date,
                    test_stat: adf_fd.test_stat,
                    pvalue: adf_fd.pvalue,
                    lags: adf_fd.lags,
                    obs: adf_fd.obs,
                    hypothesis: adf_fd.hypothesis,
                },
            }),

            // Load ADF Second Difference Data to Prisma
            await prismadb.adf.create({
                data: {
                    symbol: ticker,
                    test: adf_secd.test,
                    date: adf_secd.date,
                    test_stat: adf_secd.test_stat,
                    pvalue: adf_secd.pvalue,
                    lags: adf_secd.lags,
                    obs: adf_secd.obs,
                    hypothesis: adf_secd.hypothesis,
                },
            }),
            
            // Load ADF Seasonal Difference Data to Prisma
            await prismadb.adf.create({
                data: {
                    symbol: ticker,
                    test: adf_sd.test,
                    date: adf_sd.date,
                    test_stat: adf_sd.test_stat,
                    pvalue: adf_sd.pvalue,
                    lags: adf_sd.lags,
                    obs: adf_sd.obs,
                    hypothesis: adf_sd.hypothesis,
                },
            }),

            // Load ADF Seasonal First Difference Data to Prisma
            await prismadb.adf.create({
                data: {
                    symbol: ticker,
                    test: adf_sfd.test,
                    date: adf_sfd.date,
                    test_stat: adf_sfd.test_stat,
                    pvalue: adf_sfd.pvalue,
                    lags: adf_sfd.lags,
                    obs: adf_sfd.obs,
                    hypothesis: adf_sfd.hypothesis,
                },
            }),
        ];

        Promise.all(dbPromises);

        return NextResponse.json(response);

    } catch (error) {
        console.log("Error", error);
        return new NextResponse("Internal error", { status: 500 })
    }
}