"""
Configuration pytest globale pour tous les tests
"""
import pytest
import sys
import os

# Ajouter le répertoire parent au path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from utils.storage import rooms


@pytest.fixture(autouse=True)
def reset_storage():
    """Fixture qui s'exécute automatiquement avant chaque test pour réinitialiser le storage"""
    rooms.clear()
    yield
    rooms.clear()
