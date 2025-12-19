// Configuration
const API_URL = 'http://127.0.0.1:5000';

// Récupérer le pseudo et le token depuis localStorage
const playerName = localStorage.getItem('playerName') || 'Utilisateur';
const authToken = localStorage.getItem('authToken');

// Vérifier qu'on a un token, sinon rediriger
if (!authToken) {
    alert('Vous devez vous connecter d\'abord');
    window.location.href = 'index.html';
}

document.getElementById('welcomeMessage').textContent = `Bienvenue ${playerName} ! Choisissez une option`;

// Gestion du formulaire de création de salle
document.getElementById('createForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const roomName = document.getElementById('roomName').value.trim();

    if (!roomName) {
        alert('Veuillez entrer un nom de salle');
        return;
    }

    try {
        // Appel API pour créer la salle
        const response = await fetch(`${API_URL}/rooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ name: roomName })
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la création de la salle');
        }

        const data = await response.json();
        const roomId = data.room_id;

        console.log('Salle créée:', roomId);

        // Rejoindre la salle automatiquement
        await joinRoom(roomId);

    } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible de créer la salle. Vérifiez que le serveur est démarré.');
    }
});

// Gestion du formulaire pour rejoindre une salle
document.getElementById('joinForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const roomCode = document.getElementById('roomCode').value.trim().toUpperCase();

    if (!roomCode || roomCode.length !== 6) {
        alert('Veuillez entrer un code de salle valide (6 caractères)');
        return;
    }

    try {
        // Vérifier que la salle existe
        const response = await fetch(`${API_URL}/rooms/${roomCode}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Salle introuvable');
        }

        console.log('Salle trouvée:', roomCode);

        // Rejoindre la salle
        await joinRoom(roomCode);

    } catch (error) {
        console.error('Erreur:', error);
        alert('Cette salle n\'existe pas ou vous n\'avez pas les permissions.');
    }
});

// Fonction pour rejoindre une salle
async function joinRoom(roomId) {
    try {
        const response = await fetch(`${API_URL}/rooms/${roomId}/players`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ name: playerName })
        });

        if (!response.ok) {
            const error = await response.json();
            // Si le joueur est déjà dans la room, continuer quand même
            if (error.error && error.error.includes('déjà dans cette room')) {
                console.log('Déjà dans la room, redirection...');
            } else {
                throw new Error(error.error || 'Erreur lors de la connexion à la salle');
            }
        }

        const data = await response.json();
        console.log('Rejoint la salle, player_id:', data.player_id);

        // Sauvegarder le room ID
        localStorage.setItem('currentRoom', roomId);

        // Rediriger vers la page de la salle
        window.location.href = `room.html?room=${roomId}`;

    } catch (error) {
        console.error('Erreur:', error);
        throw error;
    }
}

// Forcer la mise en majuscule du code de salle
document.getElementById('roomCode').addEventListener('input', function (e) {
    e.target.value = e.target.value.toUpperCase();
});
