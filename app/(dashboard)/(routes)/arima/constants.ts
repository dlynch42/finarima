import * as z from 'zod';

export const formSchema = z.object({
    company: z.string().min(1, { 
        message: 'Ticker or Company Name is required' 
    }),
});
