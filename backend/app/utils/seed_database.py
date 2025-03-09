from app import db
from app.models.flashcards import Flashcard
import logging

def seed_database():
    logger = logging.getLogger(__name__)
    logger.info('Seeding flashcards...')

    existing_flashcards = Flashcard.query.count()
    if existing_flashcards > 0:
        logger.info('Flashcards already exist in database')
        return
    
    KAZAKH_WORDS = [
        {"word": "рақмет", "eng_translation": "thank you", "rus_translation": "спасибо", "phonetic": "ɾɑqmɛt"},
        {"word": "сәлем", "eng_translation": "hello", "rus_translation": "привет", "phonetic": "sælem"},
        {"word": "жақсы", "eng_translation": "good", "rus_translation": "хорошо", "phonetic": "ʒɑqsɨ"},
        {"word": "дос", "eng_translation": "friend", "rus_translation": "друг", "phonetic": "dɔs"},
        {"word": "әке", "eng_translation": "father", "rus_translation": "папа", "phonetic": "ækɛ"},
        {"word": "ана", "eng_translation": "mother", "rus_translation": "мама", "phonetic": "ɑnɑ"},
        {"word": "су", "eng_translation": "water", "rus_translation": "вода", "phonetic": "sʊ"},
        {"word": "нан", "eng_translation": "bread", "rus_translation": "хлеб", "phonetic": "nɑn"},
        {"word": "қала", "eng_translation": "city", "rus_translation": "город", "phonetic": "qɑlɑ"},
        {"word": "күн", "eng_translation": "sun/day", "rus_translation": "солнце/день", "phonetic": "kyn"},
    ]

    for card in KAZAKH_WORDS:
        new_card = Flashcard(**card)
        db.session.add(new_card)

        logger.info(f'Added flashcard: {new_card}')

    try:
        db.session.commit()
        logger.info('Flashcards seeded successfully')
    except Exception as e:
        db.session.rollback()
        logger.error(f'Error seeding flashcards: {e}')