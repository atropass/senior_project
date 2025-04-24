from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from app import db
from app.models.user_progress import UserProgress

stats_bp = Blueprint('stats', __name__)


@stats_bp.route('/user', methods=['GET'])
@jwt_required()
def get_user_stats():
    current_user_id = get_jwt_identity()
    limit = request.args.get('limit', default=10, type=int)
    page = request.args.get('page', default=0, type=int)
    offset = page * limit

    stats = db.session.query(
        func.count(UserProgress.id).label("total_attempts"),
        func.avg(UserProgress.accuracy).label("average_accuracy"),
        func.avg(UserProgress.pronunciation_score).label("average_pronunciation_score"),
        func.avg(UserProgress.rhythm_regularity).label("avg_rhythm_regularity"),
        func.avg(UserProgress.speech_rate).label("avg_speech_rate")
    ).filter(UserProgress.user_id == current_user_id).first()

    latest_entries = UserProgress.query \
        .filter_by(user_id=current_user_id) \
        .order_by(UserProgress.created_at.desc()) \
        .offset(offset).limit(limit).all()

    latest_serialized = [
        {
            "flashcard_id": entry.flashcard_id,
            "accuracy": entry.accuracy,
            "pronunciation_score": entry.pronunciation_score,
            "predicted_text": entry.predicted_text,
            "reference_text": entry.reference_text,
            "created_at": entry.created_at.isoformat()
        }
        for entry in latest_entries
    ]

    grouped = db.session.query(
        UserProgress.flashcard_id,
        func.count(UserProgress.id).label("attempts"),
        func.avg(UserProgress.accuracy).label("avg_accuracy"),
        func.avg(UserProgress.pronunciation_score).label("avg_pron_score")
    ).filter(UserProgress.user_id == current_user_id) \
        .group_by(UserProgress.flashcard_id) \
        .all()

    grouped_serialized = []
    for g in grouped:
        flashcard_id = g.flashcard_id

        phoneme_stats = db.session.query(UserProgress.phoneme_details) \
            .filter_by(user_id=current_user_id, flashcard_id=flashcard_id) \
            .all()

        # Aggregate phoneme stats
        phoneme_count = {}
        for phoneme_entry in phoneme_stats:
            for phoneme_detail in phoneme_entry.phoneme_details:
                phoneme = phoneme_detail["phoneme"]
                if phoneme not in phoneme_count:
                    phoneme_count[phoneme] = {"correct": 0, "incorrect": 0, "total_similarity": 0, "count": 0}

                phoneme_count[phoneme]["count"] += 1
                if phoneme_detail["correct"]:
                    phoneme_count[phoneme]["correct"] += 1
                else:
                    phoneme_count[phoneme]["incorrect"] += 1

                phoneme_count[phoneme]["total_similarity"] += phoneme_detail["similarity"]

        grouped_serialized.append({
            "flashcard_id": g.flashcard_id,
            "attempts": g.attempts,
            "avg_accuracy": round(g.avg_accuracy or 0, 2),
            "avg_pronunciation_score": round(g.avg_pron_score or 0, 2),
            "phoneme_stats": [
                {
                    "phoneme": phoneme,
                    "correct": phoneme_data["correct"],
                    "incorrect": phoneme_data["incorrect"],
                    "avg_similarity": round(phoneme_data["total_similarity"] / phoneme_data["count"], 2) if
                    phoneme_data["count"] > 0 else 0
                }
                for phoneme, phoneme_data in phoneme_count.items()
            ]
        })

    return jsonify({
        "summary": {
            "total_attempts": stats.total_attempts or 0,
            "average_accuracy": round(stats.average_accuracy or 0, 2),
            "average_pronunciation_score": round(stats.average_pronunciation_score or 0, 2),
            "avg_rhythm_regularity": round(stats.avg_rhythm_regularity or 0, 3),
            "avg_speech_rate": round(stats.avg_speech_rate or 0, 2)
        },
        "latest_attempts": latest_serialized,
        "grouped_by_flashcard": grouped_serialized,
        "pagination": {
            "page": page,
            "limit": limit
        }
    })


@stats_bp.route("/global", methods=['GET'])
@jwt_required()
def get_global_stats():
    limit = request.args.get('limit', default=10, type=int)
    page = request.args.get('page', default=0, type=int)
    offset = page * limit

    stats = db.session.query(
        func.count(UserProgress.id).label("total_attempts"),
        func.avg(UserProgress.accuracy).label("average_accuracy"),
        func.avg(UserProgress.pronunciation_score).label("average_pronunciation_score"),
        func.avg(UserProgress.rhythm_regularity).label("avg_rhythm_regularity"),
        func.avg(UserProgress.speech_rate).label("avg_speech_rate")
    ).first()

    latest_entries = UserProgress.query \
        .order_by(UserProgress.created_at.desc()) \
        .offset(offset).limit(limit).all()

    latest_serialized = [
        {
            "user_id": entry.user_id,
            "flashcard_id": entry.flashcard_id,
            "accuracy": entry.accuracy,
            "pronunciation_score": entry.pronunciation_score,
            "predicted_text": entry.predicted_text,
            "reference_text": entry.reference_text,
            "created_at": entry.created_at.isoformat()
        }
        for entry in latest_entries
    ]

    grouped = db.session.query(
        UserProgress.flashcard_id,
        func.count(UserProgress.id).label("attempts"),
        func.avg(UserProgress.accuracy).label("avg_accuracy"),
        func.avg(UserProgress.pronunciation_score).label("avg_pron_score")
    ).group_by(UserProgress.flashcard_id).all()

    grouped_serialized = []
    for g in grouped:
        flashcard_id = g.flashcard_id

        phoneme_stats = db.session.query(UserProgress.phoneme_details) \
            .filter_by(flashcard_id=flashcard_id) \
            .all()

        phoneme_count = {}
        for phoneme_entry in phoneme_stats:
            for phoneme_detail in phoneme_entry.phoneme_details:
                phoneme = phoneme_detail["phoneme"]
                if phoneme not in phoneme_count:
                    phoneme_count[phoneme] = {"correct": 0, "incorrect": 0, "total_similarity": 0, "count": 0}

                phoneme_count[phoneme]["count"] += 1
                if phoneme_detail["correct"]:
                    phoneme_count[phoneme]["correct"] += 1
                else:
                    phoneme_count[phoneme]["incorrect"] += 1

                phoneme_count[phoneme]["total_similarity"] += phoneme_detail["similarity"]

        grouped_serialized.append({
            "flashcard_id": g.flashcard_id,
            "attempts": g.attempts,
            "avg_accuracy": round(g.avg_accuracy or 0, 2),
            "avg_pronunciation_score": round(g.avg_pron_score or 0, 2),
            "phoneme_stats": [
                {
                    "phoneme": phoneme,
                    "correct": phoneme_data["correct"],
                    "incorrect": phoneme_data["incorrect"],
                    "avg_similarity": round(phoneme_data["total_similarity"] / phoneme_data["count"], 2) if
                    phoneme_data["count"] > 0 else 0
                }
                for phoneme, phoneme_data in phoneme_count.items()
            ]
        })

    return jsonify({
        "summary": {
            "total_attempts": stats.total_attempts or 0,
            "average_accuracy": round(stats.average_accuracy or 0, 2),
            "average_pronunciation_score": round(stats.average_pronunciation_score or 0, 2),
            "avg_rhythm_regularity": round(stats.avg_rhythm_regularity or 0, 3),
            "avg_speech_rate": round(stats.avg_speech_rate or 0, 2)
        },
        "latest_attempts": latest_serialized,
        "grouped_by_flashcard": grouped_serialized,
        "pagination": {
            "page": page,
            "limit": limit
        }
    })
