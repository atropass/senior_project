from flask import Flask, render_template, request, jsonify
import os
from script import analyze_phoneme_accuracy
from transformers import pipeline
from pronunciation_analysis import setup_analyzer
import librosa

app = Flask(__name__)

model_name = "adilism/wav2vec2-large-xlsr-kazakh"
asr_pipeline = None
analyzer = None

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
    global asr_pipeline, analyzer
    asr_pipeline = pipeline("automatic-speech-recognition", model=model_name)
    analyzer = setup_analyzer(model_name)


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

    try:
        # Save audio file
        audio_file.save(temp_path)

        # Load audio for analysis
        waveform, sample_rate = librosa.load(temp_path, sr=16000)

        # Get ASR result first
        result = asr_pipeline(temp_path)
        predicted_text = result["text"]

        # Get phoneme analysis
        phoneme_analysis = analyze_phoneme_accuracy(reference_text, predicted_text)

        # Get pronunciation analysis with both waveform and predicted text
        pronunciation_analysis = analyzer.analyze_pronunciation(
            waveform=waveform,
            sample_rate=sample_rate,
            reference_text=reference_text,
            predicted_text=predicted_text,
        )

        # Combine the analyses
        response = {
            "predicted_text": predicted_text,
            "reference_text": reference_text,
            "phoneme_analysis": pronunciation_analysis["phoneme_analysis"],
            "pronunciation_score": pronunciation_analysis["pronunciation_score"],
            "confidence": pronunciation_analysis["confidence"],
            "timing_scores": pronunciation_analysis["timing_scores"],
            "rhythm_metrics": pronunciation_analysis["rhythm_metrics"],
            "detailed_feedback": pronunciation_analysis["detailed_feedback"],
        }

        return jsonify(response)

    except Exception as e:
        app.logger.error(f"Error processing audio: {str(e)}")
        return jsonify({"error": str(e)}), 500

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


init_model()
if __name__ == "__main__":
    app.run(debug=True)
