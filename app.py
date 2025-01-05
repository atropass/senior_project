from flask import Flask, render_template, request, jsonify
import os
from script import analyze_phoneme_accuracy
from transformers import pipeline

app = Flask(__name__)

model_name = "adilism/wav2vec2-large-xlsr-kazakh"
asr_pipeline = None

KAZAKH_WORDS = [
    {"word": "рақмет", "translation": "thank you", "phonetic": "ɾɑqmɛt"},
    {"word": "сәлем", "translation": "hello", "phonetic": "sælem"},
    {"word": "жақсы", "translation": "good", "phonetic": "ʒɑqsɨ"},
    {"word": "дос", "translation": "friend", "phonetic": "dɔs"},
    {"word": "әке", "translation": "father", "phonetic": "ækɛ"},
    {"word": "ана", "translation": "mother", "phonetic": "ɑnɑ"},
    {"word": "су", "translation": "water", "phonetic": "sʊ"},
    {"word": "нан", "translation": "bread", "phonetic": "nɑn"},
    {"word": "қала", "translation": "city", "phonetic": "qɑlɑ"},
    {"word": "күн", "translation": "sun/day", "phonetic": "kyn"},
]


def init_model():
    global asr_pipeline
    asr_pipeline = pipeline("automatic-speech-recognition", model=model_name)


@app.route("/")
def index():
    return render_template("index.html", words=KAZAKH_WORDS)


@app.route("/analyze", methods=["POST"])
def analyze():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]
    word_index = request.form.get("word_index", type=int)

    if word_index is None or word_index >= len(KAZAKH_WORDS):
        return jsonify({"error": "Invalid word index"}), 400

    reference_text = KAZAKH_WORDS[word_index]["word"]

    temp_path = "temp_audio.wav"
    audio_file.save(temp_path)

    try:
        result = asr_pipeline(temp_path)
        predicted_text = result["text"]

        analysis = analyze_phoneme_accuracy(reference_text, predicted_text)

        os.remove(temp_path)

        return jsonify(
            {
                "predicted_text": predicted_text,
                "reference_text": reference_text,
                "analysis": analysis,
            }
        )

    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    init_model()
    app.run(debug=True)
