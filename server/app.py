from flask import Flask
from flask_cors import CORS

from routes import rooms_bp
from routes import players_bp
from routes import userstories_bp
from utils.storage import rooms, players

app = Flask(__name__)
CORS(app)  # Activer CORS pour toutes les routes

app.register_blueprint(rooms_bp)
app.register_blueprint(players_bp)
app.register_blueprint(userstories_bp)

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 Serveur Planning Poker démarré")
    print("="*60)
    print(f"📦 Rooms en mémoire: {len(rooms)}")
    print(f"👥 Joueurs en mémoire: {len(players)}")
    print("💡 Note: Le warning 'development server' est normal en mode debug")
    print("="*60 + "\n")
    app.run(debug=True)