import { NextResponse } from 'next/server';
import prismadb from "@/lib/prismadb";
// Store ARIMA Data in Prisma

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

// Generate a response from API
export async function POST(
    req: Request
) { 
    const responseData = await req.json();
    
    try {        
        // Results
        const ticker: string = responseData.ticker;
        const summary:  Summary = responseData.summary;
        const adf_fd: Adf = responseData.adf_fd;
        const adf_secd: Adf = responseData.adf_secd;
        const adf_sd: Adf = responseData.adf_sd;
        const adf_sfd: Adf = responseData.adf_sfd;

        // Dates
        const statdate = new Date(summary.Date).toISOString();
        const fddate = new Date(adf_fd.date).toISOString();
        const secddate = new Date(adf_secd.date).toISOString();
        const sddate = new Date(adf_sd.date).toISOString();
        const sfddate = new Date(adf_sfd.date).toISOString();

        // Load Summary data to Prisma
        try {
            await prismadb.stats.create({
                data: {
                    symbol: ticker,
                    date: statdate,
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
            });
            console.log("Summary data successfully loaded.");
        } catch (error) {
            console.error("Error loading Summary data:", error);
        }

        // Load ADF First Difference Data to Prisma
        try {
            await prismadb.adf.create({
                data: {
                    symbol: ticker,
                    test: adf_fd.test,
                    date: fddate,
                    test_stat: adf_fd.test_stat.toString(),
                    pvalue: adf_fd.pvalue.toString(),
                    lags: adf_fd.lags.toString(),
                    obs: adf_fd.obs.toString(),
                    hypothesis: adf_fd.hypothesis.toString(),
                },
            });
            console.log("ADF First Difference data successfully loaded.");
        } catch (error) {
            console.error("Error loading ADF First Difference data:", error);
        }

        // Load ADF Second Difference Data to Prisma
        try {
            await prismadb.adf.create({
                data: {
                    symbol: ticker,
                    test: adf_secd.test,
                    date: secddate,
                    test_stat: adf_secd.test_stat.toString(),
                    pvalue: adf_secd.pvalue.toString(),
                    lags: adf_secd.lags.toString(),
                    obs: adf_secd.obs.toString(),
                    hypothesis: adf_secd.hypothesis.toString(),
                },
            });
            console.log("ADF Second Difference data successfully loaded.");
        } catch (error) {
            console.error("Error loading ADF Second Difference data:", error);
        }
        
        // Load ADF Seasonal Difference Data to Prisma
        try {    
            await prismadb.adf.create({
                data: {
                    symbol: ticker,
                    test: adf_sd.test,
                    date: sddate,
                    test_stat: adf_sd.test_stat.toString(),
                    pvalue: adf_sd.pvalue.toString(),
                    lags: adf_sd.lags.toString(),
                    obs: adf_sd.obs.toString(),
                    hypothesis: adf_sd.hypothesis.toString(),
                },
            });
            console.log("ADF Seasonal Difference data successfully loaded.");
        } catch (error) {
            console.error("Error loading ADF Seasonal Difference data:", error);
        }

        // Load ADF Seasonal First Difference Data to Prisma
        try {    
            await prismadb.adf.create({
                data: {
                    symbol: ticker,
                    test: adf_sfd.test,
                    date: sfddate,
                    test_stat: adf_sfd.test_stat.toString(),
                    pvalue: adf_sfd.pvalue.toString(),
                    lags: adf_sfd.lags.toString(),
                    obs: adf_sfd.obs.toString(),
                    hypothesis: adf_sfd.hypothesis.toString(),
                },
            });
            console.log("ADF Seasonal First Difference data successfully loaded.");
        } catch (error) {
            console.error("Error loading ADF Seasonal First Difference data:", error);
        }

        // send the post object back to the client
        console.log("Success");

        return NextResponse.json("Successfully loaded data to Prisma DB", { status: 200 })

    } catch (error) {
        console.log("Error:", error);
        return new NextResponse("Internal error", { status: 500 })
    }
}