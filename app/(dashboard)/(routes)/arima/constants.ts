import * as z from 'zod';

export const formSchema = z.object({
    company: z.string().min(1, { 
        message: 'Ticker or Company Name is required' 
    }),
    // options: z.string(),
});

// From constants image
/*
export const formSchema = z.object({
    prompt: z.string().min(1, { 
        message: 'Image Prompt is required' 
    }),
    amount: z.string().min(1),
    resolution: z.string().min(1)
});

// Options: Number of photos
export const modelPlots = [
    {
        value: 'all',
        label: 'All Plots',
    },
    {
        value: 'ts',
        label: 'Time Series',
    },
    {
        value: 'diff',
        label: 'Differencing',
    },
    {
        value: 'resid',
        label: 'Residuals',
    },
    {
        value: 'acf',
        label: 'Autocorrelation',
    },
];

// Options: Resolution
export const resolutionOptions = [
    {
        value: "256x256",
        label: "256x256"
    },
    {
        value: "512x512",
        label: "512x512"
    },
    {
        value: "1024x1024",
        label: "1024x1024"
    }
];
*/