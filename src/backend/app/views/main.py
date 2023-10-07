from flask import Blueprint, jsonify, render_template, request, url_for
import random
import geopandas as gpd
import json
from random import choice
import os
import glob
import pandas as pd

df_kommuner = pd.read_csv('src/frontend/static/data/kommuner.csv')


random_municipality_name = ""
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
    with open('src/frontend/static/data/Kommuner-large.json') as f:
        kommune = json.load(f)
    with open('src/frontend/static/data/Fylker-large.json') as f:
        fylke = json.load(f)
    return jsonify(kommuner=kommune, fylker=fylke)
    #return jsonify(kommune)



@bp.route('/get-random-municipality')
def get_random_municipality():
    with open('src/frontend/static/data/Kommuner-large.json') as f:
        data = json.load(f)

    random_municipality = choice(data['features'])
    #name = random_municipality['properties']['navn']
    # number = str(random_municipality['properties']['kommunenummer'])
    name = get_random_municipality_from_county("Vestland")
    number = str(df_kommuner[df_kommuner['Name']== name]['Number[1] (ISO 3166-2:NO)'].values[0])
    print(name)


    global random_municipality_name
    random_municipality_name = name

    if number[0] == "0":
        number = number[1:]
    fylke = df_kommuner[df_kommuner['Number[1] (ISO 3166-2:NO)']== int(number)]['County'].values[0]

    # Search for the file based on the starting number
    search_path = os.path.join('src', 'frontend', 'static', 'data', 'Kommuner', 'All', f"{number}*.svg")
    matching_files = glob.glob(search_path)

    if not matching_files:
        # If no matching file is found, return an error or a default image
        print(f"Image not found for {name}")
        return jsonify(error="Image not found"), 404

    # Take the first matching file
    icon_filename = os.path.basename(matching_files[0])
    icon_path = url_for('static', filename=f'data/Kommuner/All/{icon_filename}')

    return jsonify(name=name, icon_url=icon_path, fylke=fylke)


@bp.route('/search-municipalities')
def search_municipalities():
    query = request.args.get('q')
    with open('src/frontend/static/data/Kommuner-large.json') as f:
        data = json.load(f)
    all_names = [municipality['properties']['navn'] for municipality in data['features']]
    matches = [name for name in all_names if name.lower().startswith(query.lower())]
    return jsonify(names=matches[:8])  # Return up to 8 matches


@bp.route('/check-guess', methods=['POST'])
def check_guess():
    data = request.json
    guess = data.get('guess', '').strip()

    global random_municipality_name
    if guess == random_municipality_name:
        return jsonify(result='correct')
    else:
        return jsonify(result='incorrect')


def get_random_municipality_from_county(county_name):
    # Filter dataframe for the specified county
    county_df = df_kommuner[df_kommuner['County'] == county_name]

    # Sample a random municipality
    random_municipality = county_df.sample(n=1).iloc[0]

    return random_municipality['Name']  # Assuming the column name for municipality is 'MunicipalityName'