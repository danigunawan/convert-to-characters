from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()

class Translation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    original_text = db.Column(db.Text(200))
    original_language = db.Column(db.String(32))
    translated_text = db.Column(db.Text(200))
    translated_language = db.Column(db.String(32))
    shortcut = db.Column(db.String(32))

    def __init__(self, original_text, original_language, translated_text, translated_language, shortcut):
        self.original_text = original_text
        self.original_language = original_language
        self.translated_text = translated_text
        self.translated_language = translated_language
        self.shortcut = shortcut

    def __repr__(self):
        return '<Translation %r>' % self.original_text

    @classmethod
    def check_for_matches(self, shortcut):
        return self.query.filter_by(shortcut=shortcut).first()
