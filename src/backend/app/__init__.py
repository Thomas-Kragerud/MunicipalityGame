from flask import Flask
import os
# create_app is a function that sets up and returns the Flask application object.
# this is known as the application factory pattern. By using this patter you are able to create multiple instances of
# your application if needed.
# Then in the run.py file you create an instance of this application
# This set up allows us to add more Blueprints as our application grows.
# Each Blueprint can be in charge of different part of your application
def create_app():
    # Get the path of the directory that contains the current file
    dir_path = os.path.dirname(os.path.realpath(__file__))
    # Construct the full path to the templates directory
    template_path = os.path.join(dir_path, '..', '..', 'frontend', 'templates')
    static_path = os.path.join(dir_path, '..', '..', 'frontend', 'static')

    app = Flask(__name__, template_folder=template_path, static_folder=static_path)
    app.secret_key = 'thom_key_69'

    from .views import main
    app.register_blueprint(main.bp) # register the Blueprint
    # this attaches the routs defined in the blueprint to the flask app instance

    return app
