#!/usr/bin/env python3
import socket
import json
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import Arima

'''
Server listens for request containing two numbers
and then sums those numbers. The server responds with
the summation
'''

class Server:

    def __init__(self, host=socket.gethostbyname("localhost"), port=54003):
        self.socket = socket.socket()
        self.socket.bind((host, port))

    def close(self):
        self.socket.close()

    def arima(self, ticker):
        self.ticker = ticker
        stock = Arima(ticker)
        forecast = stock.plot_forecast()

        data = {
            'ticker': ticker,
            'forecast': forecast,  
        }
        
        return data

    def listen(self):
        self.socket.listen(1)
        conn, addr = self.socket.accept()
        while True:
            data = conn.recv(1024).decode()
            ticker = data.upper()
            arima = self.arima(ticker)
            # Serialize the dictionary to a JSON string and add a newline character at the end
            json_data = json.dumps(arima) + '\n'
            conn.send(json_data.encode())

if __name__ == "__main__":
    server = Server()
    server.listen()