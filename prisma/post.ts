import prismadb from "@/lib/prismadb";
import type { NextApiRequest, NextApiResponse } from 'next';

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

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req
  
    switch (method) {
      case 'POST':
        // get the title and content from the request body
        const reqbody = req.body

        // Results
        const ticker: string = reqbody.ticker;
        const summary:  Summary = reqbody.summary;
        const adf_fd: Adf = reqbody.adf_fd;
        const adf_secd: Adf = reqbody.adf_secd;
        const adf_sd: Adf = reqbody.adf_sd;
        const adf_sfd: Adf = reqbody.adf_sfd;

        // use prisma to create a new post using that data
        // Load Summary data to Prisma
        const stats = await prismadb.stats.create({
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
        });

        // Load ADF First Difference Data to Prisma
        const fd = await prismadb.adf.create({
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
        });

        // Load ADF Second Difference Data to Prisma
        const secd = await prismadb.adf.create({
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
        });
        
        // Load ADF Seasonal Difference Data to Prisma
        const sd = await prismadb.adf.create({
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
        });

        // Load ADF Seasonal First Difference Data to Prisma
        const sfd = await prismadb.adf.create({
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
        });
        // send the post object back to the client
        res.status(201).json(stats)
        res.status(201).json(fd)
        res.status(201).json(secd)
        res.status(201).json(sd)
        res.status(201).json(sfd)
        break
      default:
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  }