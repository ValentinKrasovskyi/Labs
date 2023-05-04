from flask import Flask, jsonify, request
import rasterio

app = Flask(__name__)


@app.route('/get_image_bbox', methods=['GET'])
def get_bbox():
    with rasterio.open('../soil_moisture.tif') as file:
        bbox_image = file.bounds
        return jsonify({
            'latitude_max': bbox_image.top,
            'latitude_min': bbox_image.bottom,
            'longitude_max': bbox_image.right,
            'longitude_min': bbox_image.left
        })

@app.route('/get_moisure_value')
def get_moisure():
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    with rasterio.open('../soil_moisture.tif') as file:
        bbox_image = file.bounds
        if( lat < bbox_image.bottom or 
            lat > bbox_image.top or
            lon < bbox_image.left or
            lon > bbox_image.right):
            return jsonify({'moisure': 'no data'})
        row, col = file.index(lon, lat)
        moisure = float(file.read(1)[row, col])

        return jsonify({'moisure': moisure})
    


if __name__ == '__main__':
    app.run(debug=True)


#Посилався на https://github.com/KharchenkoV/geo/tree/master/lab9