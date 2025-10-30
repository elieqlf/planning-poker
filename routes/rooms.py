from flask import request, jsonify
from . import rooms_bp
import uuid

rooms = {}

@rooms_bp.route('/rooms', methods=['GET'])
def get_rooms():
    return jsonify(rooms)

@rooms_bp.route('/room/<room_id>', methods=['GET'])
def get_room(room_id):
    if room_id not in rooms:
        return jsonify({
            'error': 'La room n\'existe pas'
        }), 404
    return jsonify(rooms[room_id])

@rooms_bp.route('/rooms', methods=['POST'])
def create_room():
    data = request.get_json()
    name = data.get("name")

    # UUID 6 digit en full maj
    room_id = str(uuid.uuid4())[:6].upper()

    rooms[room_id] = {
        'name': name,
        'players': []
    }

    return jsonify({
        'room_id': room_id
    }), 201 # qqchose a était créé

@rooms_bp.route('/rooms/<room_id>', methods=['POST'])
def join_room(room_id):
    # Si la room n'existe pas, on return une erreur
    if room_id not in rooms:
        return jsonify({
            'error': 'La room n\'existe pas'
        }), 404

    # Récupère/Créé les infos du joueur
    data = request.get_json()
    player_name = data.get('name')
    player_id = str(len(rooms[room_id]['players']) + 1)

    # Ajoute le joueur a la room
    rooms[room_id]['players'].append({
        'player_id': player_id,
        'player_name': player_name
    })

    return jsonify({
        'player_id': player_id
    }), 200 # Ok