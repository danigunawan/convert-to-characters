import os
from flask import request, render_template, url_for, jsonify
from googletrans import Translator
from yandex_translate import YandexTranslate
from collections import OrderedDict
from setup_app import create_app
from models import *
import pdb

app = create_app()

@app.route("/")
def index():
    languages = [("English", "en"), ("Filipino", "tl"), ("Japanese", "ja")]
    recognitions = [("English", "en-US"), ("Filipino", "fil-PH"), ("Japanese", "ja")]
    translators = [("Google Translate", "google_translate"), ("Yandex Translate", "yandex_translate")]

    return render_template("index.html", languages=OrderedDict(languages), recognitions=OrderedDict(recognitions), translators=OrderedDict(translators))

@app.route("/translate", methods=["POST"])
def translate():
    translation = {
        "translated_text": "",
        "original_text": request.form["text"],
        "source_language": request.form["src"],
        "destination_language": request.form["dest"],
        "api": request.form["api"]
    }

    if translation["original_text"]:
        matching_record = Translation.check_for_matches(translation["original_text"])
        if matching_record is None:
            translation["translated_text"] = get_translated_text_from_api(translation["api"], translation["original_text"], translation["destination_language"])
        else:
            translation["translated_text"] = matching_record.translated_text
            translation["destination_language"] = matching_record.translated_language
            translation["original_text"] = matching_record.original_text
            translation["source_language"] = matching_record.original_language
        return jsonify(translation)
    else:
        return jsonify({ "success": False })

@app.route("/save_translation", methods=["POST"])
def save_translation():
    translation = Translation(request.form["original_text"], request.form["original_language"],
                              request.form["translated_text"], request.form["translated_language"],
                              request.form["shortcut"])
    db.session.add(translation)
    db.session.commit()
    return jsonify({ "success": True })

@app.route("/show_translations")
def show_translations():
    translations = Translation.query.all()
    return render_template("translations.html", translations=translations)

@app.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)

def dated_url_for(endpoint, **values):
    if endpoint == "static":
        filename = values.get("filename", None)
        if filename:
            file_path = os.path.join(app.root_path,
                                     endpoint, filename)
            values["q"] = int(os.stat(file_path).st_mtime)
    return url_for(endpoint, **values)

def get_translated_text_from_api(api, original_text, destination_language):
    if api is "google_translate":
        translator = Translator()
        return translator.translate(original_text, dest=destination_language).text
    else:
        translator = YandexTranslate(app.config["API_KEY"])
        return translator.translate(original_text, destination_language)["text"][0]

if __name__ == "__main__":
    app.run()
