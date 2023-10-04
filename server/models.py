import numpy as np
import pandas as pd
from pandas.plotting import autocorrelation_plot
from pandas.tseries.holiday import USFederalHolidayCalendar
from pandas.tseries.offsets import CustomBusinessDay, DateOffset
import statsmodels.api as sm
from statsmodels.tsa.arima_model import ARIMA
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf
from statsmodels.tsa.stattools import adfuller
from statsmodels.tsa.seasonal import seasonal_decompose
import matplotlib.pyplot as plt
import yfinance as yf
import warnings
import re
import datetime
warnings.simplefilter(action='ignore', category=FutureWarning)

class Arima():
    def __init__(self, ticker, forecast_timeframe=252, show=False, options=False):
        # Global Constants
        self.FD = 'First Difference'
        self.SECD ='Second Difference'
        self.SD = 'Seasonal Difference'
        self.SFD = 'Seasonal First Difference'
        self.now = datetime.datetime.now().strftime('%Y-%m-%d')
        
        # Global Variables
        self.ticker = ticker
        self.show = show
        self.options = options 
        self.forecast_timeframe = forecast_timeframe
        
        # Global Dataframe
        self.df, self.time_series = self.setup(ticker)
        self.df, self.adf_fd, self.adf_secd, self.adf_sd, self.adf_sfd = self.differencing(self.df)
        self.df, self.results = self.model(self.df)
        self.forecasted_df = self.forecast(self.df, self.forecast_timeframe)
        
        # TODO : Load into Prisma

    # Setups
    def setup(self, ticker):
        # Get stock data
        stock = yf.Ticker(ticker).history(period="10y")
        
        # Reset index to index rather than date
        stock = stock.reset_index()
        
        # Create new df with only date and close
        df = stock[['Date', 'Close']]
        df['Date'] = pd.to_datetime(df['Date'], format='%Y-%m-%d').dt.date
        df.set_index('Date', inplace=True)

        # Create time series
        time_series = df['Close']
            
        return df, time_series
            
    def differencing(self, df):
        # Differencing: first difference, change from one period to the next
        df[self.FD] = df['Close'] - df['Close'].shift(1)
        adf_fd = self.adf_check(self.df[self.FD].dropna(), self.FD)

        # Second
        df[self.SECD] = df[self.FD] - df[self.FD].shift(1)
        adf_secd = self.adf_check(self.df[self.SECD].dropna(), self.SECD)
        
        # Seasonal
        df[self.SD] = df['Close'] - df['Close'].shift(30)
        adf_sd = self.adf_check(self.df[self.SD].dropna(), self.SD)
        
        # Seasonal First Difference
        df[self.SFD] = df[self.FD] - df[self.FD].shift(30)
        adf_sfd = self.adf_check(self.df[self.SFD].dropna(), self.SFD)
        
        return df, adf_fd, adf_secd, adf_sd, adf_sfd
       
    def model(self, df):
        # Need frequency for SARIMA model
        df.index.freq = 'D' # may or may not need
        
        # seasonal arima model
        model = sm.tsa.arima.ARIMA(df['Close'], order=(0, 1, 0), seasonal_order=(0, 1, 0, 365))
        
        # Fit model to see results
        results = model.fit(method='innovations_mle', low_memory=True, cov_type='none')
            
        return df, results
    
    def forecast(self, df, forecast_timeframe):
        # Reset the index of df
        df.reset_index(drop=False, inplace=True)
        
        # Forecast Length
        start = len(df)
        end = round(len(df) + forecast_timeframe)
        
        # Forecasting Current
        df['Forecast'] = self.results.predict(start=start, end=end)
        
        # Forecast future values, create and add time periods to do so
        start_date = df['Date'].max()
        # Create a CustomBusinessDay object to exclude weekends and holidays
        us_bd = CustomBusinessDay(calendar=USFederalHolidayCalendar())
        # Create future dates
        future_dates = pd.date_range(start_date, periods=forecast_timeframe, freq=us_bd).strftime('%Y-%m-%d')
        
        df.set_index('Date', inplace=True)

        # Create a future dates df
        future_df = pd.DataFrame(index=future_dates, columns=df.columns)
        future_df.index.name = 'Date'
        
        # Concatenate the original df with the future_df
        forecasted_df = pd.concat([df, future_df])
        forecasted_df.index.name = 'Date'
        
        forecasted_df.reset_index(inplace=True)
        
        forecasted_df['Forecast'] = self.results.predict(start=start, end=end)
        
        return forecasted_df
       
    # Plots
    def plot_forecast(self):
        # Plot
        plt.figure()
        
        self.forecasted_df.set_index('Date', inplace=True)
        self.forecasted_df[['Close', 'Forecast']].plot(figsize=(12, 8))

        # X limit
        plt.xlim((len(self.df) - 252), len(self.forecasted_df))

        # Add a grid with dotted lines
        plt.grid(linestyle='--')

        # Choose the number of evenly spaced ticks you want (e.g., 12)
        num_ticks = 12

        # Calculate tick positions
        tick_positions = np.linspace((len(self.df) - 252), (len(self.forecasted_df) - 1), num_ticks, dtype=int)

        # Get the corresponding dates for the tick positions
        tick_labels = self.forecasted_df.index[tick_positions]

        # Set the ticks and labels
        plt.xticks(tick_positions, tick_labels, rotation=45)  # Rotate labels for better visibility

        # Labels
        plt.xlabel('Date')
        plt.ylabel('Price ($)')
        plt.title(f'Forecasted Price of {self.ticker}')
        
        forecast = f'public/plots/forecast/{self.ticker}_{self.now}_arima_forecast.png'
        plt.savefig(forecast, bbox_inches='tight')
        plt.close()  # Close the current figure
        
        return forecast
    
    def plot_timeseries(self):
        # Create rolling mean
        self.time_series.rolling(252).mean().plot(label='252 Day Rolling Mean')
        self.time_series.plot()
        
        # Create rolling std
        self.time_series.rolling(21).std().plot(label='21 Day Rolling STD')
        self.time_series.plot()
        
        plt.legend(['252 Day Rolling Mean', '21 Day Rolling STD'])
        plt.title('Time Series Analysis')
        
        # ETS Plot
        decomp = seasonal_decompose(self.time_series, period=12)
        decomp.plot()
    
    def plot_diff(self): # TODO : instead of plotting, return as images
        '''
        Plot the first difference, second difference, seasonal difference, and seasonal first difference.
        '''
        # Create a separate figure for each plot
        plt.figure()
        
        # First difference, change from one period to the next
        self.df[self.FD] = self.df['Close'].dropna() - self.df['Close'].dropna().shift(1)
        
        # Plot First Difference
        self.df[self.FD].dropna().plot()
        plt.title(self.FD)
        plt.xlabel('Date')
        fd = f'public/plots/diff/{self.ticker}_{self.now}_arima_{self.FD.lower()}.png'
        plt.savefig(fd, bbox_inches='tight')
        plt.close()  # Close the current figure
        
        # Create a new figure for the second difference
        plt.figure()
        
        # Second Difference
        self.df[self.SECD] = self.df[self.FD].dropna() - self.df[self.FD].dropna().shift(1)
        
        # Plot Second Difference
        self.df[self.SECD].dropna().plot()
        plt.title(self.SECD)
        plt.xlabel('Date')
        secd = f'public/plots/diff/{self.ticker}_{self.now}_arima_{self.SECD.lower()}.png'
        plt.savefig(secd, bbox_inches='tight')
        plt.close()  # Close the current figure
        
        # Seasonal
        plt.figure()
        self.df[self.SD] = self.df['Close'].dropna() - self.df['Close'].dropna().shift(30)
        self.df[self.SD].dropna().plot()
        
        plt.title(self.SD)
        plt.xlabel('Date')
        
        sd = f'public/plots/diff/{self.ticker}_{self.now}_arima_{self.SD.lower()}.png'
        plt.savefig(sd, bbox_inches='tight')
        plt.close()  # Close the current figure
        
        # Seasonal First Difference
        plt.figure()
        self.df[self.SFD] = self.df[self.FD] - self.df[self.FD].shift(30)
        self.df[self.SFD].plot()
        
        plt.title(self.SFD)
        plt.xlabel('Date')
        
        sfd = f'public/plots/diff/{self.ticker}_{self.now}_arima_{self.SFD.lower()}.png'
        plt.savefig(sfd, bbox_inches='tight')
        plt.close()  # Close the current figure
        
        return fd, secd, sd, sfd
    
    def plot_resid(self):
        self.results.resid.plot()
        self.results.resid.plot(kind='kde')
        
    def plot_autocorrelation(self):
        # Autocorrelation Plots
        plot_acf(self.df[self.FD].dropna())        
        plot_acf(self.df[self.SFD].dropna())
        autocorrelation_plot(self.df[self.SFD].dropna())
        plot_pacf(self.df[self.SFD].dropna())
    
    # Stats
    def summ(self):
        ''' 
        Create summary statistics for the model to load into DB.
        '''
        summary = self.summ_stats()
        summary = pd.DataFrame.from_dict(summary, orient='index', columns=['Value'])
        summary.index.name = 'Stat'
        
        return summary

    def adf(self):
        '''
        Just returns the adf results
        '''
        return self.adf_fd, self.adf_secd, self.adf_sd, self.adf_sfd
    
    # Loaders
    def load_forecast(self):
        # self.forecasted_df.insert(0, 'Symbol', ticker)
        
        # self.forecasted_df.to_csv('forecast.csv')
        pass
    
    def load_adf(self):
        pass
    
    # Helpers    
    def adf_check(self, time_series, title):  
        # Stationarity
        result = adfuller(time_series)
        
        print(f"{title} Augmented Dicky-Fuller Test")
        
        # Initialize dictinoaries
        adf = {
            'symbol': self.ticker,
            'test': title,
            'date': self.now
        }
        
        stats = {
            'test_stat': '',
            'pvalue': '',
            'lags': '',
            'obs': ''
        }
        
        # Add values results
        labels = ['test_stat', 'pvalue', 'lags', 'obs']
        for label, value in zip(labels, result):
            # Check if the label exists in the stats dictionary
            if label in stats:
                # Assign the value to the corresponding key in the stats dictionary
                stats[label] = value
        
        # Return hypothesis       
        if result[1] <= 0.05:
            hyp = 'Strong evidence against null hypothesis. Reject null hypothesis. Data has no unit root and is stationary'
            res = {'hypothesis': hyp}
            
        else:
            hyp = 'Weak evidence against null hypothesis. Fail to reject null hypothesis. Data has a unit root and is non-stationary'
            res = {'hypothesis': hyp}
        
        # Add results to stats
        for k, v in res.items():
            stats[k] = v
        
        for k, v in stats.items():
            adf[k] = v
        
        return adf

    def summ_stats(self):
        summary = str(self.results.summary())
        
        # Define regular expressions for the desired values
        patterns = {
            'Model': r'Model:\s+(.*?)\s+Log',
            'Log Likelihood': r'Log Likelihood\s+(\S+)',
            'Date': r'Date:\s+(.*?)\s+AIC',
            'AIC': r'AIC\s+(\S+)',
            'Time': r'Time:\s+(\S+)\s+BIC',
            'BIC': r'BIC\s+(\S+)',
            'Sample': r'Sample:\s+(\S+)\s+HQIC',
            'HQIC': r'HQIC\s+(\S+)',
            'sigma2': r'sigma2\s+(\S+)',
            'Ljung-Box (L1) (Q)': r'Ljung-Box \(L1\) \(Q\):\s+(\S+)',
            'Jarque-Bera (JB)': r'Jarque-Bera \(JB\):\s+(\S+)',
            'Prob(Q)': r'Prob\(Q\):\s+(\S+)',
            'Heteroskedasticity (H)': r'Heteroskedasticity \(H\):\s+(\S+)',
            'Skew': r'Skew:\s+(\S+)',
            'Prob(H) (two-sided)': r'Prob\(H\) \(two-sided\):\s+(\S+)',
            'Kurtosis': r'Kurtosis:\s+(\S+)',
        }
        
        # Initialize a dictionary to store extracted values
        extracted_data = {}
        
        # Iterate through the patterns and extract the data
        for key, pattern in patterns.items():
            match = re.search(pattern, summary)
            if match:
                extracted_data[key] = match.group(1)
                
        return extracted_data
    
# Add more models below 
if __name__ == '__main__':
    stock = Arima('NG=F')
    forecast = stock.plot_forecast()
    print(forecast)