from app import db
from app.models.associations import flashcard_categories
from datetime import datetime, timezone

class Flashcard(db.Model):
    __tablename__ = 'flashcards'
    
    word_id = db.Column(db.Integer, primary_key=True)
    word = db.Column(db.String(64), nullable=False, unique=True)
    picture = db.Column(db.String(256), default='default.jpg')
    eng_translation = db.Column(db.String(64))
    rus_translation = db.Column(db.String(64))
    phonetic = db.Column(db.String(64), nullable=False)
    audio = db.Column(db.String(256), nullable=False, default='default.wav')

    categories = db.relationship('Category', secondary=flashcard_categories, backref=db.backref('flashcards', lazy='dynamic'))

    created_by_user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    
    def __init__(self, word, eng_translation, rus_translation, phonetic, created_by_user_id):
        self.word = word
        self.eng_translation = eng_translation
        self.rus_translation = rus_translation
        self.phonetic = phonetic
        self.created_by_user_id = created_by_user_id
        
        # These are just for convenience/representation, not database columns
        self.front = word
        self.back = {
            "eng_translation": eng_translation,
            "rus_translation": rus_translation,
            "phonetic": phonetic
        }
        
    def __repr__(self):
        return f'<Flashcard {self.word} - {self.phonetic}>'
    
    def to_dict(self):
        return {
            'word_id': self.word_id,
            'word': self.word,
            'categories': [category.name for category in self.categories],
            'picture': self.picture,
            'eng_translation': self.eng_translation,
            'rus_translation': self.rus_translation,
            'phonetic': self.phonetic,
            'audio': self.audio
        }