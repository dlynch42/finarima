import os
import sys
import json
import socket

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import Arima

class Client:
    def __init__(self, host=socket.gethostbyname('localhost'), port=54003):
        self.socket = socket.socket()
        self.socket.connect((host, port))

    def close(self):
        self.socket.close()

    '''
    Send two numbers to be added to Server
    Numbers are sent as strings and response 
    is the summation.
    '''
    def arima(self, ticker):
        message = ticker
        self.socket.send(message.encode())

        response = self.socket.recv(1024).decode()
        # Parse the JSON response
        arima = json.loads(response)
        return arima