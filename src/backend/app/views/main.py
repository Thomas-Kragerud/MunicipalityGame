from flask import Blueprint, jsonify, render_template, request
import random
import geopandas as gpd
import json
from random import choice


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
    with open('src/backend/app/data/Kommuner-large.json') as f:
        data = json.load(f)
    return jsonify(data)


@bp.route('/get-random-municipality')
def get_random_municipality():
    with open('src/backend/app/data/Kommuner-large.json') as f:
        data = json.load(f)
    random_municipality = choice(data['features'])
    name = random_municipality['properties']['navn']
    icon_path = f'kjoh'
    return jsonify(name=name, icon_url=icon_path)