import pytest
import sys
import os

# Ajouter le répertoire parent au path pour pouvoir importer les modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from utils.storage import rooms, players


@pytest.fixture
def client():
    """Fixture pour créer un client de test Flask"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def sample_room():
    """Fixture pour créer une room de test"""
    room_id = "TEST01"
    rooms[room_id] = {
        'name': 'Test Room',
        'players': [],
        'stories': {}
    }
    yield room_id
    # Nettoyage après le test
    if room_id in rooms:
        rooms.pop(room_id)


class TestJoinRoom:
    """Tests pour l'endpoint POST /rooms/<room_id>/players"""
    
    def test_join_room_success(self, client, sample_room):
        """Test: un joueur peut rejoindre une room existante"""
        response = client.post(
            f'/rooms/{sample_room}/players',
            json={'name': 'Alice'}
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'player_id' in data
        assert data['player_id'] == '1'
        
        # Vérifier que le joueur a bien été ajouté à la room
        assert len(rooms[sample_room]['players']) == 1
        assert rooms[sample_room]['players'][0]['player_name'] == 'Alice'
    
    def test_join_room_nonexistent(self, client):
        """Test: impossible de rejoindre une room qui n'existe pas"""
        response = client.post(
            '/rooms/NONEXISTENT/players',
            json={'name': 'Bob'}
        )
        
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data
        assert data['error'] == 'La room n\'existe pas'
    
    def test_join_room_without_name(self, client, sample_room):
        """Test: impossible de rejoindre sans fournir un nom"""
        response = client.post(
            f'/rooms/{sample_room}/players',
            json={}
        )
        
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data
        assert data['error'] == 'Il faut un nom pour rejoindre la room'


class TestGetPlayers:
    """Tests pour l'endpoint GET /rooms/<room_id>/players"""
    
    def test_get_players_success(self, client, sample_room):
        """Test: récupérer la liste des joueurs d'une room"""
        # Ajouter quelques joueurs à la room
        rooms[sample_room]['players'].append({
            'player_id': '1',
            'player_name': 'Alice'
        })
        rooms[sample_room]['players'].append({
            'player_id': '2',
            'player_name': 'Bob'
        })
        
        response = client.get(f'/rooms/{sample_room}/players')
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) == 2
        assert data[0]['player_name'] == 'Alice'
        assert data[1]['player_name'] == 'Bob'
    
    def test_get_players_nonexistent_room(self, client):
        """Test: erreur si la room n'existe pas"""
        response = client.get('/rooms/NONEXISTENT/players')
        
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data
        assert data['error'] == 'La room n\'existe pas'


class TestKickPlayer:
    """Tests pour l'endpoint DELETE /rooms/<room_id>/players/<player_id>"""
    
    def test_kick_player_success(self, client, sample_room):
        """Test: expulser un joueur d'une room"""
        # Ajouter des joueurs à la room
        rooms[sample_room]['players'].append({
            'player_id': '1',
            'player_name': 'Alice'
        })
        rooms[sample_room]['players'].append({
            'player_id': '2',
            'player_name': 'Bob'
        })
        
        # Expulser le joueur avec l'ID '1'
        response = client.delete(f'/rooms/{sample_room}/players/1')
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) == 1
        # Vérifier que seul Bob reste
        assert data[0]['player_id'] == '2'
        assert data[0]['player_name'] == 'Bob'
        
        # Vérifier dans le storage
        assert len(rooms[sample_room]['players']) == 1
        assert rooms[sample_room]['players'][0]['player_name'] == 'Bob'
    
    def test_kick_player_nonexistent_room(self, client):
        """Test: erreur si la room n'existe pas"""
        response = client.delete('/rooms/NONEXISTENT/players/1')
        
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data
        assert data['error'] == 'La room n\'existe pas'
    
    def test_kick_player_nonexistent_player(self, client, sample_room):
        """Test: erreur si le joueur n'existe pas"""
        # Ajouter un joueur à la room
        rooms[sample_room]['players'].append({
            'player_id': '1',
            'player_name': 'Alice'
        })
        
        # Essayer d'expulser un joueur inexistant
        response = client.delete(f'/rooms/{sample_room}/players/999')
        
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data
        assert 'n\'existe pas' in data['error']
