from flask import request, jsonify
from . import userstories_bp
from utils.storage import rooms
from utils.auth import token_required

@userstories_bp.route('/rooms/<room_id>/userstories', methods=['POST'])
@token_required
def add_userstory(room_id, current_user_id):
    if room_id not in rooms:
        return jsonify({
            'error': 'La room n\'existe pas'
        }), 404
    
    data = request.get_json()
    title = data.get('title')
    id = str(len(rooms[room_id]['stories']) + 1)

    rooms[room_id]['stories'][id] = {
        'id': id,
        'title': title,
        'status': 'pending',
        'votes': {},
        'revealed': False,
        'final_vote': None
    }

    return jsonify(rooms[room_id]['stories'][id])

@userstories_bp.route('/rooms/<room_id>/userstories/<userstory_id>/vote', methods=['POST'])
@token_required
def add_vote(room_id, userstory_id, current_user_id):
    if room_id not in rooms:
        return jsonify({
            'error': 'La room n\'existe pas'
        }), 404
    
    if userstory_id not in rooms[room_id]['stories']:
        return jsonify({
            'error': 'La userstory n\'existe pas'
        }), 404
    
    data = request.get_json()
    # Utilise l'ID du token si player_id n'est pas fourni
    player_id = data.get("player_id", str(current_user_id))
    vote = data.get("vote")
    
    rooms[room_id]['stories'][userstory_id]['votes'][player_id] = vote

    return jsonify(rooms[room_id]['stories'][userstory_id]['votes'][player_id]), 201
    
@userstories_bp.route('/rooms/<room_id>/userstories', methods=['GET'])
@token_required
def get_userstories(room_id, current_user_id):
    if room_id not in rooms:
        return jsonify({
            'error': 'La room n\'existe pas'
        }), 404
    
    return jsonify(rooms[room_id]['stories']), 200

@userstories_bp.route('/rooms/<room_id>/userstories/<userstory_id>', methods=['GET'])
@token_required
def get_userstory(room_id, userstory_id, current_user_id):
    if room_id not in rooms:
        return jsonify({
            'error': 'La room n\'existe pas'
        }), 404
    
    if userstory_id not in rooms[room_id]['stories']:
        return jsonify({
            'error': 'La userstory n\'existe pas'
        }), 404
    
    return jsonify(rooms[room_id]['stories'][userstory_id]), 200

@userstories_bp.route('/rooms/<room_id>/userstories/<userstory_id>', methods=['POST'])
@token_required
def update_userstory(room_id, userstory_id, current_user_id):
    if room_id not in rooms:
        return jsonify({
            'error': 'La room n\'existe pas'
        }), 404
    
    if userstory_id not in rooms[room_id]['stories']:
        return jsonify({
            'error': 'La userstory n\'existe pas'
        }), 404
    
    data = request.get_json()

    if 'title' in data:
        rooms[room_id]['stories'][userstory_id]['title'] = data.get('title')
    if 'revealed' in data:
        rooms[room_id]['stories'][userstory_id]['revealed'] = data.get('revealed')
    if 'status' in data:
        rooms[room_id]['stories'][userstory_id]['status'] = data.get('status')
    if 'final_vote' in data:
        rooms[room_id]['stories'][userstory_id]['final_vote'] = data.get('final_vote')

    return jsonify(rooms[room_id]['stories'][userstory_id]), 200

    
