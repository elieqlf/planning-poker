import pytest
import sys
import os

# Ajouter le répertoire parent au path pour pouvoir importer les modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from utils.storage import rooms


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


class TestGetRooms:
    """Tests pour l'endpoint GET /rooms"""
    
    def test_get_all_rooms(self, client):
        """Test: récupérer toutes les rooms"""
        # Nettoyer les rooms avant le test
        rooms.clear()
        
        # Ajouter quelques rooms de test
        rooms["ROOM01"] = {'name': 'Room 1', 'players': [], 'stories': {}}
        rooms["ROOM02"] = {'name': 'Room 2', 'players': [], 'stories': {}}
        
        response = client.get('/rooms')
        
        assert response.status_code == 200
        data = response.get_json()
        assert "ROOM01" in data
        assert "ROOM02" in data
        assert len(data) == 2
        
        # Nettoyer après le test
        rooms.clear()


class TestGetRoom:
    """Tests pour l'endpoint GET /rooms/<room_id>"""
    
    def test_get_room_success(self, client, sample_room):
        """Test: récupérer une room existante"""
        response = client.get(f'/rooms/{sample_room}')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['name'] == 'Test Room'
        assert data['players'] == []
        assert data['stories'] == {}
    
    def test_get_room_nonexistent(self, client):
        """Test: erreur si la room n'existe pas"""
        response = client.get('/rooms/NOEXIST')
        
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data
        assert data['error'] == "La room n'existe pas"


class TestCreateRoom:
    """Tests pour l'endpoint POST /rooms"""
    
    def test_create_room_success(self, client):
        """Test: créer une nouvelle room"""
        response = client.post('/rooms', json={'name': None})
        
        assert response.status_code == 201
        data = response.get_json()
        assert 'room_id' in data
        
        room_id = data['room_id']
        assert room_id in rooms
        assert rooms[room_id]['name'] is None
        assert rooms[room_id]['players'] == []
        assert rooms[room_id]['stories'] == {}
        
        # Nettoyer
        rooms.pop(room_id)
    
    def test_create_room_with_name(self, client):
        """Test: créer une room avec un nom spécifique"""
        room_name = "Ma Super Room"
        response = client.post('/rooms', json={'name': room_name})
        
        assert response.status_code == 201
        data = response.get_json()
        assert 'room_id' in data
        
        room_id = data['room_id']
        assert room_id in rooms
        assert rooms[room_id]['name'] == room_name
        
        # Nettoyer
        rooms.pop(room_id)
    
    def test_room_id_format(self, client):
        """Test: vérifier le format de l'ID généré (6 caractères en majuscule)"""
        response = client.post('/rooms', json={'name': 'Test'})
        
        assert response.status_code == 201
        data = response.get_json()
        room_id = data['room_id']
        
        # Vérifier que l'ID fait 6 caractères
        assert len(room_id) == 6
        # Vérifier que tous les caractères sont en majuscule
        assert room_id.isupper()
        # Vérifier que ce sont des caractères alphanumériques
        assert room_id.isalnum()
        
        # Nettoyer
        rooms.pop(room_id)


class TestDeleteRoom:
    """Tests pour l'endpoint DELETE /rooms/<room_id>"""
    
    def test_delete_room_success(self, client, sample_room):
        """Test: supprimer une room existante"""
        # Vérifier que la room existe
        assert sample_room in rooms
        
        response = client.delete(f'/rooms/{sample_room}')
        
        assert response.status_code == 200
        # Vérifier que la room a été supprimée
        assert sample_room not in rooms
    
    def test_delete_room_nonexistent(self, client):
        """Test: erreur si la room n'existe pas"""
        response = client.delete('/rooms/NOEXIST')
        
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data
        assert data['error'] == "La room n'existe pas"
