from flask import Flask, jsonify
from flask_cors import CORS

from models import Arima

app = Flask(__name__)
CORS(app)

ticker = 'NG=F'

@app.route('/api/arima', methods=['GET'])
def return_arima():
    
    stock = Arima(ticker)
    
    return jsonify({
                'ticker': f'{ticker}',
                'summary': f'{stock.summ()}',
                'adf': f'{stock.adf()}',
            }), 200
    
if __name__ == '__main__':
    app.run(debug=True, port=8080)