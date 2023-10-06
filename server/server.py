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

@app.route('/api/arima', methods=['POST'])
def return_arima():
    if request.method == 'POST':
        # Parse the JSON data
        request_data = json.loads(request.data)
        ticker = request_data.get('messages', [])[-1].upper() #.get('newMessages', [])
        print(f"Received user message: {ticker}", sep='\n')
    
    stock = Arima(ticker)
    # forecast = stock.plot_forecast()
    # print('forecast: ', forecast)
    
    summary = stock.summ().to_dict()
    # adf = stock.adf()
    
    adf_fd, adf_secd, adf_sd, adf_sfd = stock.adf()
    # adf_fd, adf_secd, adf_sd, adf_sfd = adf_fd.to_dict(), adf_secd.to_dict(), adf_sd.to_dict(), adf_sfd.to_dict()

    # ts = stock.plot_timeseries()
    # diff = stock.plot_diff()
    # resid = stock.plot_resid()
    # acf = stock.plot_autocorrelation()

    # Get the image dimensions from the saved file    
    data = {
        # Mandatory fields
        'ticker': ticker,
        # 'forecast': forecast,
        
        # Stats
        'summary': summary,
        'adf': {
            'fd': adf_fd, 
            'secd': adf_secd, 
            'sd': adf_sd, 
            'sfd': adf_sfd
        }
        
        # Optional fields
        # 'ts': ts,
        # 'diff': diff,
        # 'resid': resid,
        # 'acf': acf,
    }
    
    print(data)
    
    return jsonify(data), 200

if __name__ == '__main__':
    app.run(debug=True, port=8080)