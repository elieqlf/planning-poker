from flask import Blueprint

rooms_bp = Blueprint('rooms', __name__)

from . import rooms