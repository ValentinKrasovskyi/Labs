from flask import Flask, jsonify
import json
app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello World!"

@app.route('/get_json/<string:filename>', methods=['GET'])
def get_json(filename):
    try:
        with open(filename + '.json', 'r') as file:
            json_data = json.load(file)
            return jsonify(json_data)
    except FileNotFoundError:
        return jsonify({'error': 'File not found'})

@app.route('/field/<string:field_name>', methods=['GET'])
def get_field(field_name):
    with open('../lab6/field_result.json', 'r') as file:
        field_data = json.load(file)
        for field in field_data:
            if field['properties']['name'] == field_name:
                return jsonify(field)
        return jsonify({'error': 'field not found'})

if __name__ == '__main__':
    app.run(debug=True)


#Посилався на https://github.com/KharchenkoV/geo/tree/master/lab8