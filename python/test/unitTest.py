import unittest
import datetime
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import Arima

class TestArima(unittest.TestCase):
    def setUp(self):
        '''
        setUp function is used to instantiate the object we are testing.
        '''
        MOCK_MESSAGE_FROM_API = "AAPL"
        self.arima = Arima(MOCK_MESSAGE_FROM_API)

    def test_plot_forecast(self):
        '''
        Test the plot forecast function.
        '''
        pf = self.arima.plot_forecast()
        expected = r'https://automodel.s3.us-west-1.amazonaws.com/public/plots/forecast/.+\.png'
        self.assertRegex(pf, expected)
        
    def test_plot_timeseries(self):
        '''
        Test the plot timeseries function.
        '''
        timeseries = self.arima.plot_timeseries()
        expected = r'https://automodel.s3.us-west-1.amazonaws.com/public/plots/timeseries/.+\.png'
        

        self.assertRegex(timeseries, expected)
        
    def test_plot_diff(self):
        '''
        Test the subtract function.
        '''
        urls = self.arima.plot_diff()
        expected = r'https://automodel.s3.us-west-1.amazonaws.com/public/plots/diff/.+\.png'
        
        # Check each URL individually
        for url in urls:
            self.assertRegex(url, expected)
    
    def test_plot_resid(self):
        '''
        Test the plot resid function.
        '''        
        resid = self.arima.plot_resid()
        expected = r'https://automodel.s3.us-west-1.amazonaws.com/public/plots/resid/.+\.png'
        self.assertRegex(resid, expected)

    def test_plot_autocorrelation(self):
        '''
        Test the plot autocorrelation function.
        '''
        urls = self.arima.plot_autocorrelation()
        expected_pattern = r'https://automodel.s3.us-west-1.amazonaws.com/public/plots/autocorrelation/.+\.png'
        
        # Check each URL individually
        for url in urls:
            self.assertRegex(url, expected_pattern)
            
    def test_summ(self):
        '''
        Test the summ function.
        '''
        summ = self.arima.summ()
        expected = {
            'Model': str,  
            'Log Likelihood': (str, float),   
            'Date': (str, datetime.date),  
            'AIC': (str, float, int),   
            'Time': (str, datetime.time),  
            'BIC': (str, float, int),  
            'Sample': (str, float, int),  
            'HQIC': (str, float, int),  
            'sigma2': (str, float, int),  
            'Ljung-Box (L1) (Q)': (str, float, int),  
            'Jarque-Bera (JB)': (str, float, int),  
            'Prob(Q)': (str, float, int),  
            'Heteroskedasticity (H)': (str, float, int),  
            'Skew': (str, float, int),  
            'Prob(H) (two-sided)': (str, float, int),  
            'Kurtosis': (str, float, int),  
        }
        
        # Iterate through the actual summary and expected types
        for key, expected_type in expected.items():
            # Check if the key exists in the actual summary
            self.assertIn(key, summ, f'{key} is missing in actual summary')
            
            # Check if the extracted value for the key matches the expected type
            actual_value = summ[key]
            self.assertIsInstance(actual_value, expected_type, f'{key} does not match the expected type')

    def test_basics(self):
        '''
        Test the basics function.
        '''
        bus, ind, web, dayhigh, daylow, dayopen, dayclose, ytdhigh, ytdlow, vol = self.arima.basics()
        # Define the expected types
        expected_types = (str, int, float)

        # Check the type of each variable
        variables = [
            ("bus", bus),
            ("ind", ind),
            ("web", web),
            ("dayhigh", dayhigh),
            ("daylow", daylow),
            ("dayopen", dayopen),
            ("dayclose", dayclose),
            ("ytdhigh", ytdhigh),
            ("ytdlow", ytdlow),
            ("vol", vol),
        ]

        for var_name, var_value in variables:
            self.assertTrue(isinstance(var_value, expected_types), f"{var_name} is not a string or number")

if __name__ == '__main__':
    unittest.main()