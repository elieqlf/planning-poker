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
        pass


class TestGetRoom:
    """Tests pour l'endpoint GET /rooms/<room_id>"""
    
    def test_get_room_success(self, client, sample_room):
        """Test: récupérer une room existante"""
        pass
    
    def test_get_room_nonexistent(self, client):
        """Test: erreur si la room n'existe pas"""
        pass


class TestCreateRoom:
    """Tests pour l'endpoint POST /rooms"""
    
    def test_create_room_success(self, client):
        """Test: créer une nouvelle room"""
        pass
    
    def test_create_room_with_name(self, client):
        """Test: créer une room avec un nom spécifique"""
        pass
    
    def test_room_id_format(self, client):
        """Test: vérifier le format de l'ID généré (6 caractères en majuscule)"""
        pass


class TestDeleteRoom:
    """Tests pour l'endpoint DELETE /rooms/<room_id>"""
    
    def test_delete_room_success(self, client, sample_room):
        """Test: supprimer une room existante"""
        pass
    
    def test_delete_room_nonexistent(self, client):
        """Test: erreur si la room n'existe pas"""
        pass
