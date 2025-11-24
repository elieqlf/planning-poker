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
        response = client.post(f'/rooms/{sample_room}/userstories', 
                              json={'title': 'Nouvelle User Story'})
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['title'] == 'Nouvelle User Story'
        assert data['status'] == 'pending'
        assert data['votes'] == {}
        assert data['revealed'] == False
        assert data['final_vote'] is None
        assert 'id' in data
    
    def test_add_userstory_nonexistent_room(self, client):
        """Test: erreur si la room n'existe pas"""
        response = client.post('/rooms/NOEXIST/userstories', 
                              json={'title': 'Test Story'})
        
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data
        assert data['error'] == "La room n'existe pas"
    
    def test_userstory_initial_status(self, client, sample_room):
        """Test: vérifier que la user story est créée avec le statut 'pending'"""
        response = client.post(f'/rooms/{sample_room}/userstories', 
                              json={'title': 'Story Test'})
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'pending'
        assert data['revealed'] == False
        assert data['votes'] == {}


class TestAddVote:
    """Tests pour l'endpoint POST /rooms/<room_id>/userstories/<userstory_id>/vote"""
    
    def test_add_vote_success(self, client, sample_room_with_story):
        """Test: ajouter un vote à une user story"""
        room_id, story_id = sample_room_with_story
        
        response = client.post(f'/rooms/{room_id}/userstories/{story_id}/vote',
                              json={'player_id': 'player1', 'vote': 5})
        
        assert response.status_code == 201
        assert response.get_json() == 5
        
        # Vérifier que le vote est bien enregistré
        assert rooms[room_id]['stories'][story_id]['votes']['player1'] == 5
    
    def test_add_vote_nonexistent_room(self, client):
        """Test: erreur si la room n'existe pas"""
        response = client.post('/rooms/NOEXIST/userstories/1/vote',
                              json={'player_id': 'player1', 'vote': 5})
        
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data
        assert data['error'] == "La room n'existe pas"
    
    def test_add_vote_nonexistent_userstory(self, client, sample_room):
        """Test: erreur si la user story n'existe pas"""
        response = client.post(f'/rooms/{sample_room}/userstories/999/vote',
                              json={'player_id': 'player1', 'vote': 5})
        
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data
        assert data['error'] == "La userstory n'existe pas"
    
    def test_update_existing_vote(self, client, sample_room_with_story):
        """Test: mettre à jour un vote existant"""
        room_id, story_id = sample_room_with_story
        
        # Ajouter un premier vote
        client.post(f'/rooms/{room_id}/userstories/{story_id}/vote',
                   json={'player_id': 'player1', 'vote': 3})
        
        # Mettre à jour le vote
        response = client.post(f'/rooms/{room_id}/userstories/{story_id}/vote',
                              json={'player_id': 'player1', 'vote': 8})
        
        assert response.status_code == 201
        assert response.get_json() == 8
        assert rooms[room_id]['stories'][story_id]['votes']['player1'] == 8


class TestGetUserstories:
    """Tests pour l'endpoint GET /rooms/<room_id>/userstories"""
    
    def test_get_userstories_success(self, client, sample_room):
        """Test: récupérer toutes les user stories d'une room"""
        # Ajouter des user stories
        client.post(f'/rooms/{sample_room}/userstories', 
                   json={'title': 'Story 1'})
        client.post(f'/rooms/{sample_room}/userstories', 
                   json={'title': 'Story 2'})
        
        response = client.get(f'/rooms/{sample_room}/userstories')
        
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) == 2
        assert '1' in data
        assert '2' in data
        assert data['1']['title'] == 'Story 1'
        assert data['2']['title'] == 'Story 2'
    
    def test_get_userstories_nonexistent_room(self, client):
        """Test: erreur si la room n'existe pas"""
        response = client.get('/rooms/NOEXIST/userstories')
        
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data
        assert data['error'] == "La room n'existe pas"


class TestRevealVotes:
    """Tests pour l'endpoint POST /rooms/<room_id>/userstories/<userstory_id> (avec revealed)"""
    
    def test_reveal_votes_success(self, client, sample_room_with_story):
        """Test: révéler les votes d'une user story"""
        room_id, story_id = sample_room_with_story
        
        response = client.post(f'/rooms/{room_id}/userstories/{story_id}',
                              json={'revealed': True})
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['revealed'] == True
        assert rooms[room_id]['stories'][story_id]['revealed'] == True
    
    def test_reveal_votes_nonexistent_room(self, client):
        """Test: erreur si la room n'existe pas"""
        response = client.post('/rooms/NOEXIST/userstories/1',
                              json={'revealed': True})
        
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data
        assert data['error'] == "La room n'existe pas"
    
    def test_reveal_votes_nonexistent_userstory(self, client, sample_room):
        """Test: erreur si la user story n'existe pas"""
        response = client.post(f'/rooms/{sample_room}/userstories/999',
                              json={'revealed': True})
        
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data
        assert data['error'] == "La userstory n'existe pas"


class TestFinalizeVote:
    """Tests pour l'endpoint POST /rooms/<room_id>/userstories/<userstory_id> (avec final_vote)"""
    
    def test_finalize_vote_success(self, client, sample_room_with_story):
        """Test: finaliser le vote d'une user story"""
        room_id, story_id = sample_room_with_story
        
        response = client.post(f'/rooms/{room_id}/userstories/{story_id}',
                              json={'final_vote': 8, 'status': 'completed'})
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['final_vote'] == 8
        assert data['status'] == 'completed'
        assert rooms[room_id]['stories'][story_id]['final_vote'] == 8
        assert rooms[room_id]['stories'][story_id]['status'] == 'completed'
    
    def test_finalize_vote_nonexistent_room(self, client):
        """Test: erreur si la room n'existe pas"""
        response = client.post('/rooms/NOEXIST/userstories/1',
                              json={'final_vote': 5})
        
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data
        assert data['error'] == "La room n'existe pas"
    
    def test_finalize_vote_nonexistent_userstory(self, client, sample_room):
        """Test: erreur si la user story n'existe pas"""
        response = client.post(f'/rooms/{sample_room}/userstories/999',
                              json={'final_vote': 5})
        
        assert response.status_code == 404
        data = response.get_json()
        assert 'error' in data
        assert data['error'] == "La userstory n'existe pas"
