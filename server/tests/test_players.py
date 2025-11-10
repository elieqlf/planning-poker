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
        pass
    
    def test_join_room_nonexistent(self, client):
        """Test: impossible de rejoindre une room qui n'existe pas"""
        pass
    
    def test_join_room_without_name(self, client, sample_room):
        """Test: impossible de rejoindre sans fournir un nom"""
        pass


class TestGetPlayers:
    """Tests pour l'endpoint GET /rooms/<room_id>/players"""
    
    def test_get_players_success(self, client, sample_room):
        """Test: récupérer la liste des joueurs d'une room"""
        pass
    
    def test_get_players_nonexistent_room(self, client):
        """Test: erreur si la room n'existe pas"""
        pass


class TestKickPlayer:
    """Tests pour l'endpoint DELETE /rooms/<room_id>/players/<player_id>"""
    
    def test_kick_player_success(self, client, sample_room):
        """Test: expulser un joueur d'une room"""
        pass
    
    def test_kick_player_nonexistent_room(self, client):
        """Test: erreur si la room n'existe pas"""
        pass
    
    def test_kick_player_nonexistent_player(self, client, sample_room):
        """Test: erreur si le joueur n'existe pas"""
        pass
