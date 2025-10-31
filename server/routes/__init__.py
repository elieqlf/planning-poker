from flask import Blueprint

rooms_bp = Blueprint('rooms', __name__)
players_bp = Blueprint('players', __name__)
userstories_bp = Blueprint('userstories', __name__)

from . import rooms
from . import players
from . import userstories