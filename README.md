# translation-python

When setting up application. Add a config.py file in the path like this translation/config.py.
It should contain a class DevelopmentConfig that inherits from a class Config with the
default settings (i.e. DEBUG, API_KEY, SECRET_KEY, SQLALCHEMY_DATABASE_URI, SQLALCHEMY_TRACK_MODIFICATIONS)

Current Commands:
Given => Translates Text Written in Text Area
Translate :language => Sets the translation language (English, Filipino, Japanese)
Recognize :language => Changes Recognition Language (English Filipino Japanese)
Translator :translator => Sets the translator (Google Translate, Yandex Translate)
Save :shortcut => saves the last translation based on the words said after Save command
