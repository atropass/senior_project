from flask import Blueprint, request, jsonify
from app.utils.get_next_due_card import get_next_flashcard_for_user_by_category

from app import db
from sqlalchemy.exc import IntegrityError

from app.models.category import Category
from app.models.flashcards import Flashcard
from app.routes.word_categories import get_flashcards_by_category
from flask_jwt_extended import jwt_required, get_jwt_identity

flashcards_bp = Blueprint('flashcards', __name__)

@flashcards_bp.route("/", methods=['GET'])
def get_flashcards():
    flashcards = Flashcard.query.all()
    res = [card.to_dict() for card in flashcards]
    return jsonify({'count': len(res), 'flashcards': res}), 200

@flashcards_bp.route("/", methods=['POST'])
def create_flashcard():
    try:
        data = request.get_json()

        required_fields = ['word', 'eng_translation', 'rus_translation', 'phonetic']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400

        current_user_id = get_jwt_identity()

        # Create new flashcard
        new_card = Flashcard(
            word=data['word'],
            eng_translation=data['eng_translation'],
            rus_translation=data['rus_translation'],
            phonetic=data['phonetic'],
            created_by_user_id=int(current_user_id)
        )
        
        # Handle optional fields
        if 'picture' in data:
            new_card.picture = data['picture']
        if 'audio' in data:
            new_card.audio = data['audio']
        
        # Add to database
        db.session.add(new_card)
        db.session.commit()

        return jsonify({'message': 'Flashcard created successfully'}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Word already exists'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@flashcards_bp.route("/<int:word_id>", methods=['GET'])
def get_flashcard_by_id(word_id):
    flashcard = Flashcard.query.get(word_id)
    if flashcard is None:
        return jsonify({'message': 'Flashcard not found'}), 404
    return jsonify({'flashcard': flashcard.to_dict()}), 200

@flashcards_bp.route("/<string:word>", methods=['GET'])
def get_flashcard_by_word(word):
    flashcard = Flashcard.query.filter_by(word=word).first()
    if flashcard is None:
        return jsonify({'message': 'Flashcard not found'}), 404
    return jsonify({'flashcard': flashcard.to_dict()}), 200

@flashcards_bp.route("/<int:word_id>", methods=['PUT', 'PATCH'])
def update_flashcard(word_id):
    try:
        flashcard = Flashcard.query.get(word_id)
        if flashcard is None:
            return jsonify({'message': 'Flashcard not found'}), 404
        
        data = request.get_json()
        if 'word' in data:
            flashcard.word = data['word']
        if 'eng_translation' in data:
            flashcard.eng_translation = data['eng_translation']
        if 'rus_translation' in data:
            flashcard.rus_translation = data['rus_translation']
        if 'phonetic' in data:
            flashcard.phonetic = data['phonetic']
        if 'picture' in data:
            flashcard.picture = data['picture']
        if 'audio' in data:
            flashcard.audio = data['audio']
        
        db.session.commit()
        return jsonify({'message': 'Flashcard updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@flashcards_bp.route("/<int:word_id>", methods=['DELETE'])
def delete_flashcard(word_id):
    flashcard = Flashcard.query.get(word_id)
    if flashcard is None:
        return jsonify({'message': 'Flashcard not found'}), 404
    db.session.delete(flashcard)
    db.session.commit()
    return jsonify({'message': 'Flashcard deleted successfully'}), 200

@flashcards_bp.route("/categories/<int:category_id>", methods=['GET'])
def get_flashcards_by_category_alias(category_id):
    return get_flashcards_by_category(category_id)

@flashcards_bp.route("/categories/<int:category_id>/next-card", methods=['GET'])
@jwt_required()
def get_next_flashcard_by_category_id(category_id):
    current_user_id = get_jwt_identity()
    user_flashcard, flashcard = get_next_flashcard_for_user_by_category(current_user_id, category_id)

    if flashcard is None:
        return jsonify({'message': 'No flashcards found'}), 404

    return jsonify({'flashcard': flashcard.to_dict()}), 200
