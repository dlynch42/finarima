from flask import Flask, jsonify
from flask_cors import CORS
from components import get_image_dimensions
import threading
import os

from models import Arima

app = Flask(__name__)
CORS(app)

ticker = 'NG=F'

@app.route('/api/arima', methods=['GET'])
def return_arima():
    
    stock = Arima(ticker)
    # Call stock.plot_forecast in the main thread and save the image to a file
    # forecast = './plots/forecast/NG=F_2023-10-04_arima_forecast.png'
    forecast = stock.plot_forecast()
    print(forecast)
    
    # if os.path.exists(forecast):
    #     # Get the image dimensions
    #     forw, forh = get_image_dimensions(forecast)
    #     print(forw, forh, sep='\n')
        
    #     data = {
    #         'ticker': f'{ticker}',
    #         'summary': f'{stock.summ()}',
    #         'adf': f'{stock.adf()}',
    #         'forecast': {
    #             'url': f'{forecast}', 
    #             'width': forw,
    #             'height': forh
    #         }
    #     }
        
    #     return jsonify(data), 200
    
    # else:
    #     e = f"Image file '{forecast}' does not exist."
    #     print(e)
    #     return jsonify({
    #         'message': e
    #         }), 500
    
    
    
    
    # # Get the image dimensions from the saved file
    # forw, forh = get_image_dimensions(forecast)
    # print(forw, forh, sep='\n')
    
    # data = {
    #     'ticker': f'{ticker}',
    #     'summary': f'{stock.summ()}',
    #     'adf': f'{stock.adf()}',
    #     'forecast': {
    #         'url': f'{forecast}', 
    #         'width': forw,
    #         'height': forh
    #     }
    # }
    
    # return jsonify(data), 200

if __name__ == '__main__':
    app.run(debug=True, port=8080)