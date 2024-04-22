## Finarima

Finarima is a project developed as the final project for my Software Architecture class. It is a data application designed to return ARIMA (AutoRegressive Integrated Moving Average) models and associated plots for a given security and time period. The application follows a robust architecture incorporating external data collection APIs, data processing, testing suites, and data storage mechanisms.

## Features

* ARIMA Model Generation: Utilizing the ARIMA algorithm, Finarima generates predictive models for the provided security and time period.
* Plot Generation: Alongside ARIMA models, the application generates visual plots to aid in the interpretation and analysis of the data.
* API Integration: Finarima integrates with external data collection APIs to gather necessary data for modeling and plotting.
* Data Processing: Data processing is carried out efficiently, either through external APIs or internal scripts, ensuring accurate modeling results.
* Testing Suites: The project includes comprehensive testing suites encompassing end-to-end tests and unit tests to maintain code quality and reliability.
* Data Storage: Data storage capabilities are implemented, ensuring seamless access to historical data for future analysis or reference.
* AWS Deployment: The application is deployed on Amazon Web Services (AWS) utilizing services such as Amazon ECS for containerized deployment, API Gateway for managing API requests, Lambda for serverless computing, and S3 for storing generated plots.

## Architecture Overview

The system architecture follows a structured flow:

* User Interaction: Users interact with the system via a POST method, providing necessary parameters such as security and time period.
* API Gateway: API Gateway manages incoming requests, directing them to the appropriate Lambda function.
* Lambda Function: Lambda function utilizes a [custom container](https://github.com/dlynch42/lambdaApi) deployed in Amazon ECS for processing. The ARIMA models are generated, and plots are designed within this environment.
* S3 Integration: Upon generation, the plots are uploaded to Amazon S3, providing users with URLs for rendering within the application.
* Response to User: The processed data along with the URLs for plots are returned to the user, completing the interaction cycle.

## Tech Stack

* Frontend: Next.js is used for the frontend development, providing a robust and interactive user interface.
* Backend: AWS services such as Lambda, ECS, API Gateway, and S3 are leveraged for backend infrastructure. It was deployed on Vercel for staging. 
* Database: MySQL (Prisma) is utilized for data storage, facilitating efficient data retrieval and management.
* Languages: Python, TypeScript, and shell scripts are employed for various components of the project, ensuring flexibility and scalability.

## Usage

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

Simply enter a stock/security ticker to make a POST request with the required parameters to the provided API endpoint. Upon processing, the application will return the ARIMA models and associated plots along with URLs for visualization.

## Contributors

Devin Lynch

## License

This project is licensed under the MIT License.

*Disclaimer: Finarima is a project developed for educational purposes and may not be suitable for production environments without further refinement and validation.*

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
