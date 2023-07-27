from flask import Blueprint

main = Blueprint('main', __name__)

@main.route('/')
@main.route('/index')
def index():
    return "Hello, World!"