from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import config

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
jwt = JWTManager()

def create_app(config_name='default') -> Flask:
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    jwt.init_app(app)
    CORS(app)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.flashcards import flashcards_bp
    from app.routes.speech import speech_bp
    from app.routes.word_categories import categories_bp
    from app.routes.favorites import favorites_bp
    from app.routes.stats import stats_bp
    # from app.routes.progress import progress_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(flashcards_bp, url_prefix='/api/flashcards')
    app.register_blueprint(speech_bp, url_prefix='/api/speech')
    app.register_blueprint(categories_bp, url_prefix='/api/categories')
    app.register_blueprint(favorites_bp, url_prefix='/api/favorites')
    app.register_blueprint(stats_bp, url_prefix='/api/stats')
    # app.register_blueprint(progress_bp, url_prefix='/api/progress')

    with app.app_context():
        from app.utils.speech_recognition import init_speech_model
        init_speech_model()
        print('Speech recognition models initialized successfully')

        from app.utils.seed_database import seed_database
        db.create_all()
        seed_database()
        print('Database seeded successfully')
    
    return app