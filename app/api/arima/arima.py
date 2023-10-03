import pandas as pd
import numpy as np
import statsmodels.api as sm
import matplotlib.pyplot as plt
import warnings
from statsmodels.tsa.arima_model import ARIMA
from pandas.tseries.offsets import DateOffset
from pandas.plotting import autocorrelation_plot
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf
from statsmodels.tsa.stattools import adfuller
from statsmodels.tsa.seasonal import seasonal_decompose
warnings.simplefilter(action='ignore', category=FutureWarning)
from flask import Flask, request, jsonify

app = Flask(__name__)

# Implementation, read resources to find pd and q values

# Autoregressive Integrated Moving Avg.
# Good at forecasting, not great for stocks

# Differencing: difference/change between Time1 and Time2, diff(Time_t) = Time2-Time1

@app.route('/api', methods=['GET', 'POST'])
def arima():
    # TODO: Create elational database for tickers with different company names
    # TODO: Get data from YFinance from input generated in frontend
    # TODO: Create pandas df from data
    # TODO: Upload CSV with data to backend database (optional)
    
    ## ARIMA
    # Step 1: Get Data
    df = pd.read_csv('monthly-milk-production-pounds-p.csv') # Can potentially replace with just a regular pd df
    df.columns = ['Month', 'Milk in Pounds per Cow']

    df.drop(168, axis=0, inplace=True)

    df['Month'] = pd.to_datetime(df['Month'])
    df.set_index('Month', inplace=True)
    print(df.describe().transpose())

    # Step 2: Visualize
    df.plot()
    # plt.show()

    time_series = df['Milk in Pounds per Cow']
    type(time_series)
    time_series.rolling(12).mean().plot(label='12 Month Rolling Mean')
    time_series.plot()
    # plt.show()
    time_series.rolling(12).std().plot(label='12 Month Rolling STD')
    time_series.plot()
    # plt.legend()

    # Step 3: ETS Plot
    decomp = seasonal_decompose(time_series)
    decomp.plot()
    plt.show()

    # Stationarity
    result = adfuller(df['Milk in Pounds per Cow'])

    def adf_check(time_series):
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

    adf_check(df['Milk in Pounds per Cow'])

    # Differencing: first difference, change from one period to the next
    df['First Difference'] = df['Milk in Pounds per Cow'] - df['Milk in Pounds per Cow'].shift(1)
    df['First Difference'].plot()
    plt.xlabel('Month')
    plt.show()

    # Run it through ADF
    adf_check(df['First Difference'].dropna())  # need to first value since we don't have it anymore

    # Second
    df['Second Difference'] = df['First Difference'] - df['First Difference'].shift(1)
    adf_check(df['Second Difference'].dropna())

    df['Second Difference'].plot()
    plt.xlabel('Month')
    plt.show()

    # Seasonal
    df['Seasonal Difference'] = df['Milk in Pounds per Cow'] - df['Milk in Pounds per Cow'].shift(12)
    df['Seasonal Difference'].plot()
    plt.xlabel('Year')
    plt.show()

    adf_check(df['Seasonal Difference'].dropna())

    # Seasonal First Difference
    df['Seasonal First Difference'] = df['First Difference'] - df['First Difference'].shift(12)
    df['Seasonal First Difference'].plot()
    plt.xlabel('Year')
    plt.show()

    adf_check(df['Seasonal First Difference'].dropna())

    # Autocorrelation Plots

    fig_first = plot_acf(df['First Difference'].dropna())
    fig_seasonal_first = plot_acf(df['Seasonal First Difference'].dropna())

    autocorrelation_plot(df['Seasonal First Difference'].dropna())
    result = plot_pacf(df['Seasonal First Difference'].dropna())

    plot_acf(df['Seasonal First Difference'].dropna())
    plot_pacf(df['Seasonal First Difference'].dropna())

    # seasonal arima model

    model = sm.tsa.statespace.SARIMAX(df['Milk in Pounds per Cow'], order=(0, 1, 0), seasonal_order=(1, 1, 1, 12))
    # Fit model to see results
    results = model.fit()
    print(results.summary())

    results.resid.plot()
    plt.show()
    results.resid.plot(kind='kde')

    # Forecasting Current
    df['forecast'] = results.predict(start=150, end=168)
    df[['Milk in Pounds per Cow', 'forecast']].plot(figsize=(12, 8))
    plt.show()

    # Forecast future values, create and add time periods to do so
    # future_dates = [df.index[-1] + DateOffset(months=x) for x in range(1, 24)]  # last index value + months=x; not working
    future_dates = pd.date_range(df.index[-1], periods=12, freq='M')
    print(future_dates)

    future_df = pd.DataFrame(index=future_dates, columns=df.columns)
    print(future_df)
    final_df = pd.concat([df, future_df])
    print(final_df.tail())

    final_df['forecast'] = results.predict(start=168, end=192)
    print(final_df.tail())

    final_df[['Milk in Pounds per Cow', 'forecast']].plot(figsize=(12, 8))
    plt.show()

if __name__ == '__main__':
    app.run(debug=True)