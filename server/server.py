import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import warnings
import threading
import os

from models import Arima

app = Flask(__name__)
CORS(app)

# TODO : Create sqlite database to store symbol and company name
# TODO : Create a function to check if the symbol is valid
# TODO : Create sqlite database to store test data

@app.route('/api/arima', methods=['POST'])
def return_arima():
    if request.method == 'POST':
        # Parse the JSON data
        request_data = json.loads(request.data)
        ticker = request_data.get('messages', [])[-1].upper()
        print(f"Received user message: {ticker}", sep='\n')
    
    stock = Arima(ticker)
    forecast = stock.plot_forecast()
    
    summary = stock.summ()
    
    adf_fd, adf_secd, adf_sd, adf_sfd = stock.adf()

    timeseries = stock.plot_timeseries()
    fd, secd, sd, sfd = stock.plot_diff()
    resid = stock.plot_resid()
    acf_fd, acf_sfd, acf_auto_sfd, pacf_sfd = stock.plot_autocorrelation()
    
    bus, ind, web, dayhigh, daylow, dayopen, dayclose, ytdhigh, ytdlow, vol = stock.basics()

    # Get the image dimensions from the saved file    
    data = {
        'ticker': ticker,
        
        # # Plotted forecast
        'forecast': forecast,  
        
        # Stats
        'summary': summary,
        'adf_fd': adf_fd,
        'adf_secd': adf_secd,
        'adf_sd': adf_sd,
        'adf_sfd': adf_sfd,
        
        'images': {
            # Timeseries Plot
            'timeseries': timeseries,
            # Differencing Plot
            'fd': fd,
            'secd': secd,
            'sd': sd,
            'sfd': sfd,
            # Residual Plot
            'resid': resid,
            # Autocorrelation Plots
            'acf_fd': acf_fd, 
            'acf_sfd': acf_sfd, 
            'acf_auto_sfd': acf_auto_sfd, 
            'pacf_sfd': pacf_sfd
        },
        
        'basics': {
            'bus': bus,
            'ind': ind,
            'web': web,
            'dayhigh': dayhigh,
            'daylow': daylow,
            'dayopen': dayopen,
            'dayclose': dayclose,
            'ytdhigh': ytdhigh,
            'ytdlow': ytdlow,
            'vol': vol
        }
    }
    
    print(data)
    
    return jsonify(data), 200

if __name__ == '__main__':
    app.run(debug=True, port=8080)