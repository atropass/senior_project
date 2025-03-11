from app import db
from app.models.flashcards import Flashcard
from app.models.category import Category
import logging

def seed_database():
    logger = logging.getLogger(__name__)
    logger.info('Seeding flashcards...')

    existing_flashcards = Flashcard.query.count()
    existing_categories = Category.query.count()

    # Populate with categories
    if existing_categories == 0:
        categories = ['Dialogues', 'Family', 'General', 'Food', 'Animals']
        category_objects = {}
        for category in categories:
            new_category = Category(name=category)
            db.session.add(new_category)
            logger.info(f'Added category: {new_category}')
            category_objects[category] = new_category

        try:
            db.session.commit()
            logger.info('Categories seeded successfully')
        except Exception as e:
            db.session.rollback()
            logger.error(f'Error seeding categories: {e}')
    else:
        category_objects = {category.name: category for category in Category.query.all()}
        logger.info('Categories already exist in database')

    if existing_flashcards > 0:
        logger.info('Flashcards already exist in database')
        return
    
    KAZAKH_WORDS = [
        {"word": "рақмет", "eng_translation": "thank you", "rus_translation": "спасибо", "phonetic": "ɾɑqmɛt", "categories": ["Dialogues"]},
        {"word": "сәлем", "eng_translation": "hello", "rus_translation": "привет", "phonetic": "sælem", "categories": ["Dialogues"]},
        {"word": "жақсы", "eng_translation": "good", "rus_translation": "хорошо", "phonetic": "ʒɑqsɨ", "categories": ["Dialogues"]},
        {"word": "дос", "eng_translation": "friend", "rus_translation": "друг", "phonetic": "dɔs", "categories": ["General"]},
        {"word": "әке", "eng_translation": "father", "rus_translation": "папа", "phonetic": "ækɛ", "categories": ["Family"]},
        {"word": "ана", "eng_translation": "mother", "rus_translation": "мама", "phonetic": "ɑnɑ", "categories": ["Family"]},
        {"word": "су", "eng_translation": "water", "rus_translation": "вода", "phonetic": "sʊ", "categories": ["Food"]},
        {"word": "нан", "eng_translation": "bread", "rus_translation": "хлеб", "phonetic": "nɑn", "categories": ["Food"]},
        {"word": "қала", "eng_translation": "city", "rus_translation": "город", "phonetic": "qɑlɑ", "categories": ["General"]},
        {"word": "күн", "eng_translation": "sun/day", "rus_translation": "солнце/день", "phonetic": "kyn", "categories": ["General"]},
    ]

    for card in KAZAKH_WORDS:
        card_categories = card.pop('categories')

        new_card = Flashcard(**card)
        for category_name in card_categories:
            new_card.categories.append(category_objects[category_name])

        db.session.add(new_card)
        logger.info(f'Added flashcard: {new_card}')

    try:
        db.session.commit()
        logger.info('Flashcards seeded successfully')
    except Exception as e:
        db.session.rollback()
        logger.error(f'Error seeding flashcards: {e}')