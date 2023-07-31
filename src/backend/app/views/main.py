from flask import Blueprint, jsonify, render_template, request
import random
#main = Blueprint('main', __name__)

# @main.route('/')
# @main.route('/index')
# def index():
#     return "Hello, World!"

#####
bp = Blueprint('main', __name__)
municipalities = ['Oslo', 'Bergen', 'Trondheim', 'Stavanger'] # Hardcoded example list

@bp.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@bp.route('/start_game', methods=['POST'])
def start_game():
    global targetMunicipality
    targetMunicipality = random.choice(municipalities)
    return jsonify(target_municipality=targetMunicipality)


@bp.route('/guess', methods=['POST'])
def guess():
    guess = request.get_json().get('guess')
    return jsonify(correct=(guess == targetMunicipality))