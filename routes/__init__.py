from flask import Blueprint

rooms_bp = Blueprint('rooms', __name__)
players_bp = Blueprint('players', __name__)

from . import rooms
from . import players