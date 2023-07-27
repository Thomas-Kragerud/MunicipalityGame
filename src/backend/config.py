import os
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))

def find_project_root(marker='.git'):
    dir = os.getcwd()
    while not os.path.isdir(os.path.join(dir, marker)):
        dir = os.path.dirname(dir)
        if dir == '/':
            raise Exception("Project root not found")
    return dir