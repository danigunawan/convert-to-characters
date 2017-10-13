import os
from flask import request, render_template, url_for, jsonify, send_from_directory
from googletrans import Translator
from yandex_translate import YandexTranslate
from collections import OrderedDict
from setup_app import create_app
# from models import *
from flask_socketio import SocketIO, emit, join_room
import pdb

import speech_recognition as sr
import argparse
import subprocess
import sys
import re

app = create_app()
socketio = SocketIO(app)

@app.route("/")
def index():
    languages = [("English", "en"), ("Filipino", "tl"), ("Japanese", "ja")]
    recognitions = [("English", "en-US"), ("Filipino", "fil-PH"), ("Japanese", "ja")]
    translators = [("Google", "google_translate"), ("Yandex", "yandex_translate")]

    return render_template("index.html", languages=OrderedDict(languages), recognitions=OrderedDict(recognitions), translators=OrderedDict(translators))

@app.route("/youtube")
def youtube():
    return render_template("youtube.html")

@app.route("/transcribe", methods=["GET"])
def transcribe():
    pattern     = re.compile("^(https?\:\/\/)?((www\.)?youtube\.com|youtu\.?be)\/.+$")
    youtube_url = request.args.get("url")

    if pattern.match(youtube_url):
        file_name   = download_video(youtube_url)
        transcription = { "transcript": read_video(file_name) }
        os.remove("youtube_audio.wav")
        return jsonify(transcription)
    else:
        return jsonify({"Error": "Must be youtube url"}), 500

def download_video(url):
    FNULL = open(os.devnull, 'w')
    ydl = subprocess.Popen('youtube-dl {url} -o "youtube_audio.%(ext)s" '
                           '--audio-format wav --extract-audio'.format(url=url), stdout=FNULL, shell=True,
                           stderr=subprocess.STDOUT)
    print "Downloading youtube video..."
    ydl.wait()
    print "Download complete!\n"
    return open("youtube_audio.wav")

def read_video(file_name):
    print 'Processing youtube video...'
    try:
        r = sr.Recognizer()
        with sr.AudioFile(file_name) as source:
            audio = r.record(source)

        # output = r.recognize_wit(audio, "AY4J4V2G2MNKE2PUNP7ACEL5CTKPUTKI")
        output = r.recognize_sphinx(audio)
    except IOError as exc:
        output = 'Unable to find the audio file.'
    except sr.UnknownValueError:
        output = 'Error reading audio'
    return output

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
        # matching_record = Translation.check_for_matches(translation["original_text"])
        matching_record = None
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
    # translation = Translation(request.form["original_text"], request.form["original_language"],
    #                           request.form["translated_text"], request.form["translated_language"],
    #                           request.form["shortcut"])
    # db.session.add(translation)
    # db.session.commit()
    return jsonify({ "success": True })

@app.route("/show_translations")
def show_translations():
    # translations = Translation.query.all()
    # return render_template("translations.html", translations=translations)
    return jsonify({"success": True})

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static', 'css'), 'favicon.ico')

@socketio.on("message", namespace="/chat")
def chat_message(message):
    emit('message', {'data': message['data']}, broadcast = True)

@socketio.on('connect', namespace='/chat')
def test_connect():
    emit('my response', {'data': 'Connected', 'count': 0})

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
    # app.run()
    socketio.run(app)
