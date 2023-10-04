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
warnings.simplefilter(action='ignore', category=FutureWarning)

class Arima():
    def __init__(self, ticker, forecast_timeframe=252, show=False, options=False):
        # Global Constants
        self.FD = 'First Difference'
        self.SECD ='Second Difference'
        self.SD = 'Seasonal Difference'
        self.SFD = 'Seasonal First Difference'
        
        # Global Variables
        self.ticker = ticker
        self.show = show
        self.options = options 
        self.forecast_timeframe = forecast_timeframe
        
        # Global Dataframe
        self.df, self.time_series = self.setup(ticker)
        self.df = self.differencing(self.df)
        self.df, self.results = self.model(self.df)
        self.forecasted_df = self.forecast(self.df, self.forecast_timeframe)
                
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

        # Second
        df[self.SECD] = df[self.FD] - df[self.FD].shift(1)
        
        # Seasonal
        df[self.SD] = df['Close'] - df['Close'].shift(30)
        
        # Seasonal First Difference
        df[self.SFD] = df[self.FD] - df[self.FD].shift(30)
        
        return df  
       
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
       
    # Methods
    def plot_forecast(self):
        # Plot
        self.forecasted_df.set_index('Date', inplace=True)
        self.forecasted_df[['Close', 'Forecast']].plot(figsize=(12, 8))

        # # X limit
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
        plt.show()
    
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
    
    def plot_diff(self):
        '''
        Plot the first difference, second difference, seasonal difference, and seasonal first difference.
        '''
        # First difference, change from one period to the next
        self.df[self.FD] = self.df['Close'].dropna() - self.df['Close'].dropna().shift(1)
        
        # Run through ADF
        self.adf_check(self.df[self.FD].dropna(), self.FD)
        
        # Plot First Difference
        self.df[self.FD].dropna().plot()
        plt.title(self.FD)
        plt.xlabel('Date')
        plt.show()

        # Second 
        self.df[self.SECD] = self.df[self.FD].dropna() - self.df[self.FD].dropna().shift(1)
        
        # Run through ADF
        self.adf_check(self.df[self.SECD].dropna(), self.SECD)

        # Plot Second Difference
        self.df[self.SECD].dropna().plot()
        plt.title(self.SECD)
        plt.xlabel('Date')
        plt.show()
        
        # Seasonal
        self.df[self.SD] = self.df['Close'].dropna() - self.df['Close'].dropna().shift(30)
        self.df[self.SD].dropna().plot()
        self.adf_check(self.df[self.SD].dropna(), self.SD)
        
        plt.title(self.SD)
        plt.xlabel('Date')
        plt.show()
        
        # Seasonal First Difference
        self.df[self.SFD] = self.df[self.FD] - self.df[self.FD].shift(30)
        self.df[self.SFD].plot()
        self.adf_check(self.df[self.SFD].dropna(), self.SFD)
        
        plt.title(self.SFD)
        plt.xlabel('Date')
        plt.show()
    
    def plot_resid(self):
        self.results.resid.plot()
        self.results.resid.plot(kind='kde')
        
    def autocorrelation(self):
        # Autocorrelation Plots
        plot_acf(self.df[self.FD].dropna())        
        plot_acf(self.df[self.SFD].dropna())
        autocorrelation_plot(self.df[self.SFD].dropna())
        plot_pacf(self.df[self.SFD].dropna())
    
    def summ(self):
        return self.results.summary()
    
    # Helpers    
    def adf_check(self, time_series, title):  
        # Stationarity
        result = adfuller(time_series)
        
        print(f"Augmented Dicky-Fuller Test for: {title}")
        labels = ['ADF Test Statistic', 'p-value', '# of lags', 'Num of Observations Used']

        for value, label in zip(result, labels):
            print(f"{label} : {str(value)}")

        if result[1] <= 0.05:
            print('Strong evidence against null hypothesis.', 
                  'Reject null hypothesis', 
                  'Data has no unit root and is stationary', '\n')
            
        else:
            print('Weak evidence against null hypothesis', 
                  'Fail to reject null hypothesis', 
                  'Data has a unit root and is non-stationary', '\n')

# Add more models below 