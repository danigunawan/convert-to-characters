from os import path

class Config(object):
    DEBUG = False
    API_KEY="trnsl.1.1.20170124T023923Z.db368f9b9c7a7f06.26bd8be0cf53946d203c786ae83d24c73ea5954d"
    SECRET_KEY="ba847f1861cb636b722ed59097bc82ce66b42da6ddf2e290"
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root@localhost/translation'
    SQLALCHEMY_TRACK_MODIFICATIONS = True

# class ProductionConfig(Config):
#     DATABASE_URI = 'mysql://user@localhost/foo'

class DevelopmentConfig(Config):
    DEBUG = True

class TestingConfig(Config):
    TESTING = True
