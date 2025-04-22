from app import db

class Favorite(db.Model):
    __tablename__ = 'favorites'

    enrty_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    word_id = db.Column(db.Integer, db.ForeignKey('flashcards.word_id'), nullable=False)

    __table_args__ = (db.UniqueConstraint('user_id', 'word_id', name='unique_user_card_favorite'),)
    
    def __init__(self, user_id, word_id):
        self.user_id = user_id
        self.word_id = word_id

    def __repr__(self):
        return f'<Favorites {self.user_id} - {self.word_id}>'
    
    def to_dict(self):
        return {
            'user_id': self.user_id,
            'word_id': self.word_id
        }