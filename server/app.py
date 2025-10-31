from flask import Flask

from routes import rooms_bp
from routes import players_bp
from routes import userstories_bp

app = Flask(__name__)

app.register_blueprint(rooms_bp)
app.register_blueprint(players_bp)
app.register_blueprint(userstories_bp)

if __name__ == '__main__':
    app.run(debug=True)