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


@pytest.fixture
def sample_room_with_story():
    """Fixture pour créer une room avec une user story"""
    room_id = "TEST02"
    rooms[room_id] = {
        'name': 'Test Room',
        'players': [],
        'stories': {
            '1': {
                'id': '1',
                'title': 'Test Story',
                'status': 'pending',
                'votes': {},
                'revealed': False,
                'final_vote': None
            }
        }
    }
    yield room_id, '1'
    # Nettoyage après le test
    if room_id in rooms:
        rooms.pop(room_id)


class TestAddUserstory:
    """Tests pour l'endpoint POST /rooms/<room_id>/userstories"""
    
    def test_add_userstory_success(self, client, sample_room):
        """Test: ajouter une user story à une room"""
        pass
    
    def test_add_userstory_nonexistent_room(self, client):
        """Test: erreur si la room n'existe pas"""
        pass
    
    def test_userstory_initial_status(self, client, sample_room):
        """Test: vérifier que la user story est créée avec le statut 'pending'"""
        pass


class TestAddVote:
    """Tests pour l'endpoint POST /rooms/<room_id>/userstories/<userstory_id>/vote"""
    
    def test_add_vote_success(self, client, sample_room_with_story):
        """Test: ajouter un vote à une user story"""
        pass
    
    def test_add_vote_nonexistent_room(self, client):
        """Test: erreur si la room n'existe pas"""
        pass
    
    def test_add_vote_nonexistent_userstory(self, client, sample_room):
        """Test: erreur si la user story n'existe pas"""
        pass
    
    def test_update_existing_vote(self, client, sample_room_with_story):
        """Test: mettre à jour un vote existant"""
        pass


class TestGetUserstories:
    """Tests pour l'endpoint GET /rooms/<room_id>/userstories"""
    
    def test_get_userstories_success(self, client, sample_room):
        """Test: récupérer toutes les user stories d'une room"""
        pass
    
    def test_get_userstories_nonexistent_room(self, client):
        """Test: erreur si la room n'existe pas"""
        pass


class TestRevealVotes:
    """Tests pour l'endpoint POST /rooms/<room_id>/userstories/<userstory_id>/reveal"""
    
    def test_reveal_votes_success(self, client, sample_room_with_story):
        """Test: révéler les votes d'une user story"""
        pass
    
    def test_reveal_votes_nonexistent_room(self, client):
        """Test: erreur si la room n'existe pas"""
        pass
    
    def test_reveal_votes_nonexistent_userstory(self, client, sample_room):
        """Test: erreur si la user story n'existe pas"""
        pass


class TestFinalizeVote:
    """Tests pour l'endpoint POST /rooms/<room_id>/userstories/<userstory_id>/finalize"""
    
    def test_finalize_vote_success(self, client, sample_room_with_story):
        """Test: finaliser le vote d'une user story"""
        pass
    
    def test_finalize_vote_nonexistent_room(self, client):
        """Test: erreur si la room n'existe pas"""
        pass
    
    def test_finalize_vote_nonexistent_userstory(self, client, sample_room):
        """Test: erreur si la user story n'existe pas"""
        pass
