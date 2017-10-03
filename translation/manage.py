# This file is for setting up database and migrations
# python manage.py create_db => creates database if it does not exist
# python manage.py db <flask_migrate_command> => refer to docs for flask_migrate_commands (i.e. upgrade, migrate)

from flask_script import Manager
from flask_migrate import MigrateCommand
from sqlalchemy import create_engine
from sqlalchemy_utils import database_exists, create_database
from setup_app import create_app
from models import db

app = create_app()
manager = Manager(app)
manager.add_command('db', MigrateCommand)

@manager.command
def create_db():
    engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'])
    if not database_exists(engine.url):
        print "Database does not exist. Creating database."
        create_database(engine.url)
    else:
        print "Database already exists."

if __name__ == '__main__':
    manager.run()
