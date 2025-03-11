from app import db

flashcard_categories = db.Table('flashcard_categories',
    db.Column('flashcard_id', db.Integer, db.ForeignKey('flashcards.word_id'), primary_key=True),
    db.Column('category_id', db.Integer, db.ForeignKey('categories.category_id'), primary_key=True)
)