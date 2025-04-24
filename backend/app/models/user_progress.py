from datetime import datetime, timezone
from app import db

class UserProgress(db.Model):
    __tablename__ = "user_progress"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    flashcard_id = db.Column(db.Integer, db.ForeignKey("flashcards.word_id"), nullable=False)

    accuracy = db.Column(db.Float, default=50.0)
    correct_phonemes = db.Column(db.Integer, default=0)
    total_phonemes = db.Column(db.Integer, default=0)
    phoneme_details = db.Column(db.JSON)
    predicted_text = db.Column(db.String)
    pronunciation_score = db.Column(db.Float)
    reference_text = db.Column(db.String)
    rhythm_regularity = db.Column(db.Float)
    speech_rate = db.Column(db.Float)

    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    flashcard = db.relationship("Flashcard", backref="progress_entries")

    def __init__(
            self,
            user_id,
            flashcard_id,
            accuracy,
            correct_phonemes,
            total_phonemes,
            phoneme_details,
            predicted_text,
            pronunciation_score,
            reference_text,
            rhythm_regularity,
            speech_rate
    ):
        self.user_id = user_id
        self.flashcard_id = flashcard_id
        self.accuracy = accuracy
        self.correct_phonemes = correct_phonemes
        self.total_phonemes = total_phonemes
        self.phoneme_details = phoneme_details or []
        self.predicted_text = predicted_text
        self.pronunciation_score = pronunciation_score
        self.reference_text = reference_text
        self.rhythm_regularity = rhythm_regularity
        self.speech_rate = speech_rate

