from flask import Flask
from .views.main import main

# create_app is a function that sets up and returns the Flask application object.
# this is known as the application factory pattern. By using this patter you are able to create multiple instances of
# your application if needed.
# Then in the run.py file you create an instance of this application
# This set up allows us to add more Blueprints as our application grows.
# Each Blueprint can be in charge of different part of your application
def create_app():
    app = Flask(__name__)
    app.register_blueprint(main)
    return app

