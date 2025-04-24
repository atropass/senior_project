from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone

from app import db
from app.models.user_flashcards import UserFlashcard
from app.models.user_progress import UserProgress
from app.models.flashcards import Flashcard
from app.utils.speech_recognition import analyze_audio
from app.utils.text_to_speech import get_pronunciation

speech_bp = Blueprint('speech', __name__)

@speech_bp.route('/analyze', methods=['POST'])
@jwt_required()
def analyze_speech():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]
    word_index = request.form.get("word_index", type=int)

    if not word_index:
        return jsonify({"error": "Missing word_index in request"}), 400

    flashcard = Flashcard.query.get(word_index)
    if not flashcard:
        return jsonify({'error': 'Flashcard not found'}), 404

    reference_text = flashcard.word

    if not audio_file.filename:
        return jsonify({'error': 'No audio file selected'}), 400

    if audio_file.filename.rsplit('.', 1)[-1].lower() != 'wav':
        return jsonify({'error': 'Unsupported file type. Please upload a .wav file'}), 400

    try:
        result = analyze_audio(audio_file, reference_text)

        if "phoneme_analysis" not in result:
            raise ValueError(f"Missing 'phoneme_analysis' in analysis result: {result}")

        accuracy = result["phoneme_analysis"].get("accuracy")
        if accuracy is None:
            raise ValueError(f"Missing 'accuracy' in phoneme_analysis result: {result}")

        current_user_id = get_jwt_identity()

        # Get or create UserFlashcard
        user_flashcard = UserFlashcard.query.filter_by(
            user_id=int(current_user_id),
            flashcard_id=word_index
        ).first()

        if not user_flashcard:
            user_flashcard = UserFlashcard(
                user_id=int(current_user_id),
                flashcard_id=word_index
            )
            db.session.add(user_flashcard)

        # Save UserProgress
        user_progress = UserProgress(
            user_id=int(current_user_id),
            flashcard_id=word_index,
            accuracy=accuracy,
            correct_phonemes=result["phoneme_analysis"]["correct_phonemes"],
            total_phonemes=result["phoneme_analysis"]["total_phonemes"],
            phoneme_details=result["phoneme_analysis"]["phoneme_details"],
            predicted_text=result["predicted_text"],
            pronunciation_score=result["pronunciation_score"],
            reference_text=result["reference_text"],
            rhythm_regularity=result["rhythm_metrics"]["rhythm_regularity"],
            speech_rate=result["rhythm_metrics"]["speech_rate"]
        )
        db.session.add(user_progress)

        # Update SM-2 logic and commit everything
        user_flashcard.review(accuracy)
        db.session.commit()

        return jsonify(result), 200

    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@speech_bp.route('/pronounce', methods=['POST'])
@jwt_required()
def get_correct_pronounciation():
    data = request.get_json()
    word_id = data['word_id']

    if not word_id:
        return jsonify({'error': 'Missing word_id in request'}), 400
    
    flashcard = Flashcard.query.get(word_id)
    if not flashcard:
        return jsonify({'error': 'Flashcard not found'}), 404
    
    reference_text_eng = flashcard.eng_translation
    reference_text_rus = flashcard.rus_translation
    reference_text_kaz = flashcard.word

    try:
        res = get_pronunciation(reference_text_kaz)
        return jsonify({'text': res['text'], 'base16_audio': res['audio']}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500