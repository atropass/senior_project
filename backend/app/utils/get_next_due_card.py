from datetime import datetime, timezone
from app import db
from app.models.user_flashcards import UserFlashcard
from app.models.flashcards import Flashcard
from app.models.category import Category
from app.models.associations import flashcard_categories


def get_next_flashcard_for_user_by_category(user_id, category_id):
    now = datetime.now(timezone.utc)

    result = (
        db.session.query(UserFlashcard, Flashcard)
        .join(Flashcard, Flashcard.word_id == UserFlashcard.flashcard_id)
        .join(flashcard_categories, Flashcard.word_id == flashcard_categories.c.flashcard_id)
        .join(Category, Category.category_id == flashcard_categories.c.category_id)
        .filter(UserFlashcard.user_id == user_id)
        .filter(Category.category_id == category_id)
        .filter(UserFlashcard.next_review <= now)
        .order_by(UserFlashcard.next_review.asc())
        .first()
    )

    if result:
        user_flashcard, flashcard = result
        return user_flashcard, flashcard

    # Step 2: Find flashcards in that category that the user hasn't seen
    subquery = (
        db.session.query(UserFlashcard.flashcard_id)
        .filter(UserFlashcard.user_id == user_id)
        .subquery()
    )

    new_flashcard = (
        db.session.query(Flashcard)
        .join(flashcard_categories, Flashcard.word_id == flashcard_categories.c.flashcard_id)
        .join(Category, Category.category_id == flashcard_categories.c.category_id)
        .filter(Category.category_id == category_id)
        .filter(~Flashcard.word_id.in_(subquery))
        .order_by(Flashcard.word_id.asc())
        .first()
    )

    if new_flashcard:
        user_flashcard = UserFlashcard(user_id=user_id, flashcard_id=new_flashcard.word_id)
        db.session.add(user_flashcard)
        db.session.commit()
        return user_flashcard, new_flashcard

    return None, None

def get_next_flashcard_for_user(user_id):
    now = datetime.now(timezone.utc)

    # Step 1: Try to find a due UserFlashcard that belongs to the given category
    result = (
        db.session.query(UserFlashcard, Flashcard)
        .join(Flashcard, Flashcard.word_id == UserFlashcard.flashcard_id)
        .filter(UserFlashcard.user_id == user_id)
        .filter(UserFlashcard.next_review <= now)
        .order_by(UserFlashcard.next_review.asc())
        .first()
    )

    if result:
        user_flashcard, flashcard = result
        return user_flashcard, flashcard

    subquery = (
        db.session.query(UserFlashcard.flashcard_id)
        .filter(UserFlashcard.user_id == user_id)
        .subquery()
    )

    new_flashcard = (
        db.session.query(Flashcard)
        .filter(~Flashcard.word_id.in_(subquery))
        .order_by(Flashcard.word_id.asc())
        .first()
    )

    if new_flashcard:
        user_flashcard = UserFlashcard(user_id=user_id, flashcard_id=new_flashcard.word_id)
        db.session.add(user_flashcard)
        db.session.commit()
        return user_flashcard, new_flashcard

    return None, None
