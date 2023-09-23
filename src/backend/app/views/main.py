from flask import Blueprint, jsonify, render_template, request, url_for
import random
import geopandas as gpd
import json
from random import choice
import os
import glob


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
    with open('src/frontend/static/data/Kommuner-large.json') as f:
        data = json.load(f)

    random_municipality = choice(data['features'])
    name = random_municipality['properties']['navn']
    number = str(random_municipality['properties']['kommunenummer'])

    if number[0] == "0":
        number = number[1:]

    # Search for the file based on the starting number
    search_path = os.path.join('src', 'frontend', 'static', 'data', 'Kommuner', 'All', f"{number}*.svg")
    matching_files = glob.glob(search_path)

    if not matching_files:
        # If no matching file is found, return an error or a default image
        return jsonify(error="Image not found"), 404

    # Take the first matching file
    icon_filename = os.path.basename(matching_files[0])
    icon_path = url_for('static', filename=f'data/Kommuner/All/{icon_filename}')

    return jsonify(name=name, icon_url=icon_path)
