from datetime import datetime, timezone
from app import db

class UserProgress(db.Model):
    __tablename__ = "user_progress"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    flashcard_id = db.Column(db.Integer, db.ForeignKey("flashcards.word_id"), nullable=False)
    score = db.Column(db.Float, default=50.0)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    def __init__(self, user_id, flashcard_id, score):
        self.user_id = user_id
        self.flashcard_id = flashcard_id
        self.score = score
