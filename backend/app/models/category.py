from app import db

class Category(db.Model):
    __tablename__ = 'categories'
    
    category_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False, unique=True)
    
    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f'<Category {self.name}>'
    
    def to_dict(self):
        return {
            'category_id': self.category_id,
            'name': self.name,
            'flashcards': [flashcard.word_id for flashcard in self.flashcards]
        }
    
