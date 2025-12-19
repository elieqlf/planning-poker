from flask import request, jsonify
from . import rooms_bp
from utils.storage import rooms
from utils.auth import token_required
import uuid

@rooms_bp.route('/rooms', methods=['GET'])
@token_required
def get_rooms(current_user_id):
    return jsonify(rooms)

@rooms_bp.route('/rooms/<room_id>', methods=['GET'])
@token_required
def get_room(room_id, current_user_id):
    if room_id not in rooms:
        return jsonify({
            'error': 'La room n\'existe pas'
        }), 404
    return jsonify(rooms[room_id])

@rooms_bp.route('/rooms', methods=['POST'])
@token_required
def create_room(current_user_id):
    data = request.get_json()
    name = data.get("name")

    # UUID 6 digit en full maj
    room_id = str(uuid.uuid4())[:6].upper()

    rooms[room_id] = {
        'name': name,
        'players': [],
        'stories': {}
    }

    return jsonify({
        'room_id': room_id
    }), 201 # qqchose a était créé

@rooms_bp.route('/rooms/<room_id>', methods=['DELETE'])
@token_required
def del_room(room_id, current_user_id):
    if room_id not in rooms:
        return jsonify({
            'error': 'La room n\'existe pas'
        }), 404
    
    rooms.pop(room_id)

    return jsonify(rooms)