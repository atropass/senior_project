import os
from app import create_app

app_config = os.environ.get('FLASK_CONFIG') or 'default'
app = create_app(app_config)

if __name__ == '__main__':
    app.run()