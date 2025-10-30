from flask import request, jsonify
from . import players_bp
from utils.storage import rooms

@players_bp.route('/rooms/<room_id>/players', methods=['POST'])
def join_room(room_id):
    # Si la room n'existe pas, on return une erreur
    if room_id not in rooms:
        return jsonify({
            'error': 'La room n\'existe pas'
        }), 404

    # Récupère/Créé les infos du joueur
    data = request.get_json()

    if 'name' not in data:
        return jsonify({
            'error': 'Il faut un nom pour rejoindre la room'
        }), 404

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

@players_bp.route('/rooms/<room_id>/players', methods=['GET'])
def get_players(room_id):
    if room_id not in rooms:
        return jsonify({
            'error': 'La room n\'existe pas'
        }), 404
    
    return jsonify(rooms[room_id]['players'])

@players_bp.route('/rooms/<room_id>/players/<player_id>', methods=['DELETE'])
def kick_player(room_id, player_id):
    if room_id not in rooms:
        return jsonify({
            'error': 'La room n\'existe pas'
        }), 404
    
    players = rooms[room_id]['players']
    player_found = False
    player_info = None
    for player in players:
        if player["player_id"] == player_id:
            player_found = True
            player_info = player
            break

    if not player_found:
        return jsonify({
            'error': f'Le joueur {player_id} n\'existe pas'
        }), 404

    rooms[room_id]['players'].remove(player_info)

    # return la nouvelle liste avec le joueur retirer
    return jsonify(rooms[room_id]['players'])

