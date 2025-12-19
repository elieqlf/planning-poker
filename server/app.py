from flask import Flask
from flask_cors import CORS

from routes import rooms_bp
from routes import players_bp
from routes import userstories_bp

app = Flask(__name__)
CORS(app)  # Activer CORS pour toutes les routes

app.register_blueprint(rooms_bp)
app.register_blueprint(players_bp)
app.register_blueprint(userstories_bp)

if __name__ == '__main__':
    app.run(debug=True)