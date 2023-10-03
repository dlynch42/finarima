// import { NextResponse } from 'next/server';
// import { useState } from 'react';

// export async function POST(
//     req: Request
// ) { 
//     try {
//         const [analysisData, setAnalysisData] = useState(null);

//         const fetchStockAnalysis = async () => {
//             try {
//             const response = await fetch('', {
//                 method: 'POST',
//                 headers: {
//                 'Content-Type': 'application/json',
//                 },
//             });
        
//             if (response.ok) {
//                 const data = await response.json();
//                 setAnalysisData(data);
//             } else {
//                 console.error('Failed to fetch stock analysis data');
//             }
//             } catch (error) {
//             console.error('Error:', error);
//             }
//         };

//         // return NextResponse.json(response.choices[0].message)

//     } catch (error) {
//         console.log("[CODE_ERROR]", error);
//         return new NextResponse("Internal error", { status: 500 })
//     }
// }