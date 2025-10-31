from flask import request, jsonify
from . import userstories_bp
from utils.storage import rooms

@userstories_bp.route('/rooms/<room_id>/userstories', methods=['POST'])
def add_userstory(room_id):
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
def add_vote(room_id, userstory_id):
    if room_id not in rooms:
        return jsonify({
            'error': 'La room n\'existe pas'
        }), 404
    
    if userstory_id not in rooms[room_id]['stories']:
        return jsonify({
            'error': 'La userstory n\'existe pas'
        }), 404
    
    data = request.get_json()
    player_id = data.get("player_id")
    vote = data.get("vote")
    
    rooms[room_id]['stories'][userstory_id]['votes'][player_id] = vote

    return jsonify(rooms[room_id]['stories'][userstory_id]['votes'][player_id]), 201
    
@userstories_bp.route('/rooms/<room_id>/userstories', methods=['GET'])
def get_userstories(room_id):
    if room_id not in rooms:
        return jsonify({
            'error': 'La room n\'existe pas'
        }), 404
    
    return jsonify(rooms[room_id]['stories']), 200

@userstories_bp.route('/rooms/<room_id>/userstories/<userstory_id>', methods=['GET'])
def get_userstory(room_id, userstory_id):
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
def update_userstory(room_id, userstory_id):
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

    
