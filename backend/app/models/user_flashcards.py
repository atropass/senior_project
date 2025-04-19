from app import db
from datetime import datetime, timedelta, timezone


def normalize_score(score):
    """
    Map score (0–100) to SM-2 quality score (0–5)
    """
    if score < 30:
        return 0  # blackout
    elif score < 50:
        return 2  # hard
    elif score < 70:
        return 3  # ok
    elif score < 85:
        return 4  # good
    else:
        return 5  # perfect


class UserFlashcard(db.Model):
    __tablename__ = "user_flashcards"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    flashcard_id = db.Column(db.Integer, db.ForeignKey("flashcards.word_id"), nullable=False)

    easiness = db.Column(db.Float, default=2.5)
    interval = db.Column(db.Integer, default=1)
    repetitions = db.Column(db.Integer, default=0)
    next_review = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    last_score = db.Column(db.Integer, nullable=True)  # store last raw score if needed

    __table_args__ = (
        db.UniqueConstraint('user_id', 'flashcard_id', name='user_flashcard_uc'),
    )

    def __init__(self, user_id, flashcard_id):
        self.user_id = user_id
        self.flashcard_id = flashcard_id
        self.easiness = 2.5
        self.interval = 1
        self.repetitions = 0
        self.next_review = datetime.now(timezone.utc)

    def review(self, score):
        """
        Accepts a score from 0 to 100 and adapts SM-2 logic.
        """
        self.last_score = score
        quality = normalize_score(score)

        if quality < 3:
            self.repetitions = 0
            self.interval = 1
        else:
            self.repetitions += 1
            if self.repetitions == 1:
                self.interval = 1
            elif self.repetitions == 2:
                self.interval = 6
            else:
                self.interval = int(self.interval * self.easiness)

        # Update easiness factor
        self.easiness += (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        if self.easiness < 1.3:
            self.easiness = 1.3

        # Update next review time
        self.next_review = datetime.now(timezone.utc) + timedelta(days=self.interval)

    def is_due(self):
        return datetime.now(timezone.utc) >= self.next_review

    def __repr__(self):
        return f"<UserFlashcard user={self.user_id}, word={self.flashcard_id}, next_review={self.next_review}, EF={self.easiness:.2f}>"
