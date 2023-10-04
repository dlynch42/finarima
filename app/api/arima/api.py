from arima import Arima
from flask import Flask, jsonify

# Create instance of Arima class
# ticker = 'NG=F'
# data = Arima(ticker)
# data.plot_forecast()
# data.plot_diff()
# data.summ()

# TODO Create flask api

app = Flask(__name__)

@app.route('/api/arima', methods=['GET'])
def return_arima():
    return jsonify({
        
    })