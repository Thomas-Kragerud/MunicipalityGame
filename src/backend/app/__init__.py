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

    app = Flask(__name__, template_folder=template_path)

    from .views import main
    app.register_blueprint(main.bp)

    return app
