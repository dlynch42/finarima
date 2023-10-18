'''
This file is called test.py
'''
import subprocess
from client import Client
import sys
import os

def test_server_client():
    '''
    We start the server and let it run in the background. Then we ask 
    the client to make a call to the server and we compare the expected value.
    '''
    
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # Define the script path relative to the script's directory
    script_path = 'server.py'

    # Create the full path by joining the script's directory and script path
    full_path = os.path.abspath(os.path.join(script_dir, script_path))

    server = subprocess.Popen(['python', full_path])
    client = Client(host='127.0.0.1', port=54003)
    arima = client.arima("AAPL")

    # Check the data structure in the arima
    assert isinstance(arima['ticker'], str)
    assert isinstance(arima['forecast'], str)