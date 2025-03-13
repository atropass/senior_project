from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from app.utils.speech_recognition import analyze_audio
from app.models.flashcards import Flashcard

speech_bp = Blueprint('speech', __name__)

@speech_bp.route('/analyze', methods=['POST'])
def analyze_speech():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    audio_file = request.files["audio"]
    word_index = request.form.get("word_index", type=int)

    reference_text = Flashcard.query.get(word_index)
    if reference_text is None:
        return jsonify({'error': 'Word not found'}), 404
    
    reference_text = reference_text.word
    
    if audio_file.filename == '':
        return jsonify({'error': 'No audio file selected'}), 400
    if audio_file and audio_file.filename.rsplit('.', 1)[1].lower() not in ['wav']:
        return jsonify({'error': 'Unsupported file type. Please upload a .wav file'}), 400
    
    try:
        result = analyze_audio(audio_file, reference_text)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500