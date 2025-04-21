from flask import Blueprint, request, jsonify
from app import db
from app.models.favorites import Favorite
from app.models.flashcards import Flashcard
from flask_jwt_extended import jwt_required, get_jwt_identity

favorites_bp = Blueprint('favorites', __name__)

@favorites_bp.route("/", methods=['GET'])
@jwt_required()
def get_favorites():
    user_id = get_jwt_identity()
    favorites = Favorite.query.filter_by(user_id=user_id).all()
    favs = [favorite.word_id for favorite in favorites]

    res = Flashcard.query.filter(Flashcard.word_id.in_(favs)).all()
    res = [flashcard.to_dict() for flashcard in res]

    return jsonify({'user_id': user_id, 'count': len(res), 'favorites': res}), 200

@favorites_bp.route("/", methods=['POST'])
@jwt_required()
def add_favorite():
    user_id = get_jwt_identity()
    data = request.get_json()
    word_id = data['word_id']
    # Check if already favorited
    existing_favorite = Favorite.query.filter_by(
        user_id=user_id, word_id=word_id
    ).first()

    if existing_favorite:
        return jsonify({'message': 'Already favored'}), 400
    
    # Add new favorite
    new_favorite = Favorite(user_id=user_id, word_id=word_id)
    db.session.add(new_favorite)
    db.session.commit()
    return jsonify({'message': 'Added to favorites'}), 201

@favorites_bp.route("/", methods=['DELETE'])
@jwt_required()
def delete_favorite():
    user_id = get_jwt_identity()
    data = request.get_json()
    word_id = data['word_id']

    # Check if favorite exists
    existing_favorite = Favorite.query.filter_by(
        user_id=user_id, word_id=word_id
    ).first()

    if not existing_favorite:
        return jsonify({'message': 'Not in favorites'}), 404

    # Delete favorite
    db.session.delete(existing_favorite)
    db.session.commit()
    return jsonify({'message': 'Removed from favorites'}), 200