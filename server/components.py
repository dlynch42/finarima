from PIL import Image

def get_image_dimensions(image_path):
    try:
        with Image.open(image_path) as img:
            width, height = img.size
            return width, height
    except Exception as e:
        print(f"Error getting image dimensions: {str(e)}")
        return None, None
    
# if __name__ == '__main__':
#     width, height = get_image_dimensions('./public/plots/forecast/NG=F_2023-10-04_arima_forecast.png')
#     print(width, height, sep='\n')