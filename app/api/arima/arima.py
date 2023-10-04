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
from flask import Flask, request, jsonify
import matplotlib.pyplot as plt
import yfinance as yf
import datetime
import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)

class Arima():
    def __init__(self, ticker, show: bool = False, options: bool = False):
        df = self.setup(ticker, options)
        
        df = self.differencing(df, show)
        
        df, results = self.model(df, show, options)
        
        df = self.forecast(df, results)
        
        # return df
        
    def setup(self, ticker, options: bool = False):
        # Get stock data
        stock = yf.Ticker(ticker).history(period="10y")
        
        # Reset index to index rather than date
        stock = stock.reset_index()
        
        # Create new df with only date and close
        df = stock[['Date', 'Close']]
        df['Date'] = pd.to_datetime(df['Date'], format='%Y-%m-%d').dt.date
        df.set_index('Date', inplace=True)
        
        # Show descriptive statistics
        if options == True:
            df.describe().transpose()

        # Create time series
        time_series = df['Close']
        # type(time_series)
        
        if options == True:
            # Create rolling mean
            time_series.rolling(252).mean().plot(label='252 Day Rolling Mean')
            time_series.plot()
            
            # Create rolling std
            time_series.rolling(21).std().plot(label='21 Day Rolling STD')
            time_series.plot()
            
            plt.legend(['252 Day Rolling Mean', '21 Day Rolling STD'])
            plt.title('Time Series Analysis')
            
            # ETS Plot
            decomp = seasonal_decompose(time_series, period=12)
            decomp.plot()
            
        return df
            
    def differencing(self, df, show: bool = False):
        if show == True:
            # Differencing: first difference, change from one period to the next
            df['First Difference'] = df['Close'] - df['Close'].shift(1)
            df['First Difference'].plot()
            plt.title('First Difference')
            plt.xlabel('Year')
            plt.show()
            
            # Run it through ADF
            # adf_check(df['First Difference'].dropna())  # need to first value since we don't have it anymore

            # Second
            df['Second Difference'] = df['First Difference'] - df['First Difference'].shift(1)
            # adf_check(df['Second Difference'].dropna())

            df['Second Difference'].plot()
            plt.title('Second Difference')
            plt.xlabel('Month')
            plt.show()
            
            # Seasonal
            df['Seasonal Difference'] = df['Close'] - df['Close'].shift(30)
            df['Seasonal Difference'].plot()
            plt.title('Seasonal Difference')
            plt.xlabel('Date')
            plt.show()

            # adf_check(df['Seasonal Difference'].dropna())
            
            # Seasonal First Difference
            df['Seasonal First Difference'] = df['First Difference'] - df['First Difference'].shift(30)
            df['Seasonal First Difference'].plot()
            plt.title('Seasonal First Difference')
            plt.xlabel('Date')
            plt.show()

            self.adf_check(df['Seasonal First Difference'].dropna())
            
            return df
        
        if show == False:
            # Differencing: first difference, change from one period to the next
            df['First Difference'] = df['Close'] - df['Close'].shift(1)
            
            # Run it through ADF
            # adf_check(df['First Difference'].dropna())  # need to first value since we don't have it anymore

            # Second
            df['Second Difference'] = df['First Difference'] - df['First Difference'].shift(1)
            # adf_check(df['Second Difference'].dropna())
            
            # Seasonal
            df['Seasonal Difference'] = df['Close'] - df['Close'].shift(30)
            # adf_check(df['Seasonal Difference'].dropna())
            
            # Seasonal First Difference
            df['Seasonal First Difference'] = df['First Difference'] - df['First Difference'].shift(30)
            # self.adf_check(df['Seasonal First Difference'].dropna())
            
            return df  
          
    def adf_check(self, time_series):
        # Stationarity
        result = adfuller(time_series)
        
        print("Augmented Dicky-Fuller Test")
        labels = ['ADF Test Statistic', 'p-value', '# of lags', 'Num of Observations Used']

        for value, label in zip(result, labels):
            print(label+" : "+str(value))

        if result[1] <= 0.05:
            print('Strong evidence against null hypothesis')
            print('reject null hypothesis')
            print('Data has no unit root and is stationary')

        else:
            print('Weak evidence against null hypothesis')
            print('Fail to reject null hypothesis')
            print('Data has a unit root and is non-stationary')
            
    def autocorrelation(self, df, show: bool = False):
        if show == True:
            # Autocorrelation Plots
            fig_first = plot_acf(df['First Difference'].dropna())        
            fig_seasonal_first = plot_acf(df['Seasonal First Difference'].dropna())

            autocorrelation_plot(df['Seasonal First Difference'].dropna())
            result = plot_pacf(df['Seasonal First Difference'].dropna())
            plot_pacf(df['Seasonal First Difference'].dropna())
            
        if show == False:
            pass
    
    def model(self, df, show: bool = False, options: bool = False):
        # Need frequency for SARIMA model
        df.index.freq = 'D' # may or may not need
        
        # seasonal arima model
        model = sm.tsa.arima.ARIMA(df['Close'], order=(0, 1, 0), seasonal_order=(0, 1, 0, 365))
        
        # Fit model to see results
        results = model.fit(method='innovations_mle', low_memory=True, cov_type='none')
        
        if options == True:
            results.summary()
        
        # Show plots and stats if true
        if show == True:
            results.resid.plot()
            results.resid.plot(kind='kde')
            
        return df, results
    
    def forecast(self, df, results):
        # Reset the index of df
        df.reset_index(drop=False, inplace=True)
        
        # Forecast Length
        start = len(df)
        end = round(len(df) + 252)  # TODO: Make dynamic
        
        # Forecasting Current
        df['forecast'] = results.predict(start=start, end=end)
        
        # Forecast future values, create and add time periods to do so
        start_date = df['Date'].max()
        # Create a CustomBusinessDay object to exclude weekends and holidays
        us_bd = CustomBusinessDay(calendar=USFederalHolidayCalendar())
        # Create future dates
        future_dates = pd.date_range(start_date, periods=252, freq=us_bd).strftime('%Y-%m-%d')  # TODO: Make dynamic period
        
        df.set_index('Date', inplace=True)

        # Create a future dates df
        future_df = pd.DataFrame(index=future_dates, columns=df.columns)
        future_df.index.name = 'Date'
        
        # Concatenate the original df with the future_df
        forecasted_df = pd.concat([df, future_df])
        forecasted_df.index.name = 'Date'
        
        forecasted_df.reset_index(inplace=True)
        
        forecasted_df['forecast'] = results.predict(start=start, end=end)
        
        return forecasted_df
    
    def plot_forecast(self, forecasted_df, df, ticker):
        # Plot
        forecasted_df[['Close', 'forecast']].plot(figsize=(12, 8))

        # # X limit
        plt.xlim((len(df) - 252), len(forecasted_df))

        # Add a grid with dotted lines
        plt.grid(linestyle='--')

        # Choose the number of evenly spaced ticks you want (e.g., 12)
        num_ticks = 12

        # Calculate tick positions
        tick_positions = np.linspace((len(df) - 252), (len(forecasted_df) - 1), num_ticks, dtype=int)

        # Get the corresponding dates for the tick positions
        tick_labels = forecasted_df.index[tick_positions]

        # Set the ticks and labels
        plt.xticks(tick_positions, tick_labels, rotation=45)  # Rotate labels for better visibility

        # Labels
        plt.xlabel('Date')
        plt.ylabel('Price ($)')
        plt.title(f'Forecasted Price of {ticker}')
        plt.show()
    
if __name__ == "__main__":
    ticker = 'NG=F'
    data = Arima(ticker)
    data.plot_forecast(data) # FIXME: Not working