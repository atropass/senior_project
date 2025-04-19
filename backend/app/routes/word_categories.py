from flask import Blueprint, jsonify
from app.models.category import Category

categories_bp = Blueprint('categories', __name__)

@categories_bp.route("/", methods=['GET'])
def get_categories():
    categories = Category.query.all()
    res = [category.to_dict() for category in categories]
    return jsonify({'count': len(res), 'categories': res}), 200

@categories_bp.route("/<int:category_id>/flashcards", methods=['GET'])
def get_flashcards_by_category(category_id):
    category = Category.query.get(category_id)
    if category is None:
        return jsonify({'message': 'Category not found'}), 404
    res = [flashcard.to_dict() for flashcard in category.flashcards]
    return jsonify({'count': len(res), 'flashcards': res}), 200