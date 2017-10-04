from flask import Flask
# from models import db, migrate

def create_app(name=None):
    """
        Setup flask application and configuration.
    """

    app = Flask(name or __name__) # create the application instance
    app.config.from_object('config.DevelopmentConfig') # load config from this file i.e. translation.py
    # db.init_app(app)
    # migrate.init_app(app, db)
    # Bootstrap(app)

    # Load default config and override config from an environment variable
    # generated the secret key by importing os and binascii
    # then calling binsacii.hexlify(os.urandom(24))
    # app.config.update(dict(
    #     SECRET_KEY=os.environ['SECRET_KEY']
    # ))
    # current implementation is setting this now in config.py previosly being set in envrc file as an export command.

    # you can uncomment this line and add a path to a file with environment variables. it works similarly to .envrc
    # e.g
    # some_file.txt (contents)
    # SECRET_KEY='some random stuff'
    # DEBUG=True
    # app.config.from_envvar('FLASKR_SETTINGS', silent=True)
    #
    # export FLASKR_SETTINGS=/somepath/some_file.txt/

    return app
