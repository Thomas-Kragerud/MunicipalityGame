from flask import Blueprint, jsonify, render_template, request
import random
import geopandas as gpd
import json

# routs are now defined in the context of this Blueprint
bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    return render_template('index.html')

# @bp.route('/geojson')
# def get_geojson():
#     df = gpd.read_file('src/backend/app/data/Fylker-medium.json')
#     return jsonify(df.to_json())

@bp.route('/geojson')
def get_geojson():
    with open('src/backend/app/data/Fylker-medium.json') as f:
        data = json.load(f)
    return jsonify(data)