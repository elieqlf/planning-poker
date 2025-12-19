// Configuration
const API_URL = 'http://127.0.0.1:5000';
const POKER_VALUES = ['0', '1/2', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?'];

// État de l'application
let currentRoom = null;
let currentPlayer = null;
let selectedTask = null;
let isCreator = false;
let tasks = {};
let authToken = null;
let pollingInterval = null;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Récupérer le token
    authToken = localStorage.getItem('authToken');
    if (!authToken) {
        alert('Vous devez vous connecter d\'abord');
        window.location.href = 'index.html';
        return;
    }

    // Récupérer les informations de la room depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    const playerName = localStorage.getItem('playerName') || 'Joueur';

    if (!roomId) {
        alert('Aucune salle spécifiée');
        window.location.href = 'room-choice.html';
        return;
    }

    currentPlayer = {
        name: playerName,
        id: null  // Sera défini après avoir rejoint la room
    };

    // Charger la salle
    loadRoom(roomId);

    // Initialiser les événements
    initializeEvents();

    // Générer les cartes de poker
    generatePokerCards();

    // Démarrer le polling pour synchroniser les données
    startPolling(roomId);
});

// Charger les informations de la salle
async function loadRoom(roomId) {
    try {
        const response = await fetch(`${API_URL}/rooms/${roomId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Salle introuvable');
        }

        currentRoom = await response.json();
        currentRoom.id = roomId;

        // Trouver l'ID du joueur actuel dans la liste des joueurs
        const myPlayer = currentRoom.players?.find(p => p.player_name === currentPlayer.name);
        if (myPlayer) {
            currentPlayer.id = myPlayer.player_id;
        }

        // Déterminer si on est le créateur (premier joueur)
        isCreator = currentRoom.players && currentRoom.players.length > 0 &&
            currentRoom.players[0].player_name === currentPlayer.name;

        // Mettre à jour l'interface
        document.getElementById('roomName').textContent = currentRoom.name;
        document.getElementById('roomCode').textContent = roomId;

        // Afficher/masquer les contrôles selon le rôle
        if (!isCreator) {
            document.getElementById('creatorActions').style.display = 'none';
        }

        // Charger les tâches
        await loadTasks();

    } catch (error) {
        console.error('Erreur lors du chargement de la salle:', error);
        alert('Impossible de charger la salle');
        window.location.href = 'room-choice.html';
    }
}

// Charger les tâches
async function loadTasks() {
    try {
        // Charger d'abord les infos de la room pour avoir la liste à jour des joueurs
        const roomResponse = await fetch(`${API_URL}/rooms/${currentRoom.id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (roomResponse.status === 404) {
            // La room n'existe plus, rediriger
            console.log('Room introuvable, redirection...');
            localStorage.removeItem('currentRoom');
            stopPolling();
            alert('Cette salle n\'existe plus. Vous allez être redirigé.');
            window.location.href = 'room-choice.html';
            return;
        }

        if (roomResponse.ok) {
            const roomData = await roomResponse.json();
            // Mettre à jour la liste des joueurs
            currentRoom.players = roomData.players;
        }

        // Ensuite charger les user stories
        const response = await fetch(`${API_URL}/rooms/${currentRoom.id}/userstories`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            tasks = await response.json();
            renderTasksList();

            // Si une tâche est sélectionnée, la mettre à jour
            if (selectedTask && tasks[selectedTask.id]) {
                selectedTask = tasks[selectedTask.id];
                showVotingInterface();
            }
        }
    } catch (error) {
        console.error('Erreur lors du chargement des tâches:', error);
    }
}

// Afficher la liste des tâches
function renderTasksList() {
    const tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = '';

    const taskIds = Object.keys(tasks);

    if (taskIds.length === 0) {
        tasksList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Aucune tâche pour le moment</p>';
        return;
    }

    taskIds.forEach(taskId => {
        const task = tasks[taskId];
        const taskElement = createTaskElement(task);
        tasksList.appendChild(taskElement);
    });
}

// Créer un élément de tâche
function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = 'task-item';
    if (selectedTask && selectedTask.id === task.id) {
        div.className += ' active';
    }

    const statusClass = task.status === 'completed' ? 'completed' : 'pending';
    const statusText = task.status === 'completed' ? 'Terminée' : 'En cours';

    div.innerHTML = `
        <div class="task-item-header">
            <span class="task-item-title">${task.title}</span>
            <span class="task-badge ${statusClass}">${statusText}</span>
        </div>
        ${task.final_vote ? `<div class="task-final-vote">Vote final: ${task.final_vote}</div>` : ''}
    `;

    div.addEventListener('click', () => selectTask(task));

    return div;
}

// Sélectionner une tâche
async function selectTask(task) {
    selectedTask = task;
    renderTasksList();

    // Charger les détails à jour de la tâche
    try {
        const response = await fetch(`${API_URL}/rooms/${currentRoom.id}/userstories/${task.id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            selectedTask = await response.json();
            tasks[selectedTask.id] = selectedTask;
        }
    } catch (error) {
        console.error('Erreur lors du chargement de la tâche:', error);
    }

    showVotingInterface();
}

// Afficher l'interface de vote
function showVotingInterface() {
    document.getElementById('noTaskSelected').classList.add('hidden');
    document.getElementById('votingInterface').classList.remove('hidden');

    document.getElementById('currentTaskTitle').textContent = selectedTask.title;

    const statusElement = document.getElementById('currentTaskStatus');
    statusElement.textContent = selectedTask.status === 'completed' ? 'Terminée' : 'En cours';
    statusElement.className = 'task-status ' + (selectedTask.status === 'completed' ? 'completed' : 'pending');

    // Mettre à jour l'état des cartes
    updateCardsState();

    // Afficher les votes
    renderParticipantsVotes();

    // Gérer les boutons du créateur
    if (isCreator) {
        updateCreatorButtons();
    }
}

// Générer les cartes de poker
function generatePokerCards() {
    const container = document.getElementById('cardsContainer');
    container.innerHTML = '';

    POKER_VALUES.forEach(value => {
        const card = document.createElement('div');
        card.className = 'poker-card';
        card.textContent = value;
        card.dataset.value = value;

        card.addEventListener('click', () => voteForCard(value));

        container.appendChild(card);
    });
}

// Voter pour une carte
async function voteForCard(value) {
    if (!selectedTask) return;
    if (selectedTask.status === 'completed') return;

    try {
        const response = await fetch(`${API_URL}/rooms/${currentRoom.id}/userstories/${selectedTask.id}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                vote: value
            })
        });

        if (!response.ok) {
            throw new Error('Erreur lors du vote');
        }

        // Mettre à jour localement
        if (!selectedTask.votes) {
            selectedTask.votes = {};
        }
        if (currentPlayer.id) {
            selectedTask.votes[currentPlayer.id] = value;
        }

        // Mettre à jour l'affichage
        updateCardsState();
        renderParticipantsVotes();

    } catch (error) {
        console.error('Erreur lors du vote:', error);
        alert('Impossible d\'enregistrer votre vote');
    }
}

// Mettre à jour l'état des cartes
function updateCardsState() {
    const cards = document.querySelectorAll('.poker-card');
    const myVote = currentPlayer.id ? selectedTask.votes?.[currentPlayer.id] : null;

    cards.forEach(card => {
        const value = card.dataset.value;
        card.classList.remove('selected', 'disabled');

        if (myVote === value) {
            card.classList.add('selected');
        }

        // Désactiver les cartes uniquement si la tâche est terminée
        // Permettre le revote tant que la tâche n'est pas finalisée
        if (selectedTask.status === 'completed') {
            card.classList.add('disabled');
        }
    });
}

// Afficher les votes des participants
function renderParticipantsVotes() {
    const container = document.getElementById('participantsList');
    container.innerHTML = '';

    const votes = selectedTask.votes || {};

    if (Object.keys(votes).length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Aucun vote pour le moment</p>';
        return;
    }

    // Afficher tous les votes
    Object.entries(votes).forEach(([playerId, vote]) => {
        // Trouver le nom du joueur dans la liste des joueurs de la room
        const player = currentRoom.players?.find(p => p.player_id === playerId);
        const playerName = player ? player.player_name : `Joueur ${playerId}`;
        const isMe = currentPlayer.id && playerId === currentPlayer.id;
        const displayName = isMe ? playerName + ' (Vous)' : playerName;

        const card = createParticipantCard(displayName, vote, selectedTask.revealed);
        container.appendChild(card);
    });
}// Créer une carte de participant
function createParticipantCard(name, vote, revealed) {
    const div = document.createElement('div');
    div.className = 'participant-card';

    const voteClass = revealed ? 'participant-vote' : 'participant-vote hidden-vote';

    div.innerHTML = `
        <span class="participant-name">${name}</span>
        <span class="${voteClass}">${revealed ? vote : ''}</span>
    `;

    return div;
}

// Mettre à jour les boutons du créateur
function updateCreatorButtons() {
    const revealBtn = document.getElementById('revealVotesBtn');
    const finalizeBtn = document.getElementById('finalizeVoteBtn');
    const revoteBtn = document.getElementById('revoteBtn');
    const differentMessage = document.getElementById('votesDifferentMessage');

    if (selectedTask.revealed) {
        revealBtn.classList.add('hidden');

        // Vérifier si tous les votes sont identiques
        const votes = Object.values(selectedTask.votes || {});
        const allSame = votes.length > 0 && votes.every(vote => vote === votes[0]);

        if (allSame) {
            // Tous les votes sont identiques, on peut finaliser
            finalizeBtn.classList.remove('hidden');
            revoteBtn.classList.add('hidden');
            differentMessage.classList.add('hidden');
        } else {
            // Les votes sont différents, il faut revoter
            finalizeBtn.classList.add('hidden');
            revoteBtn.classList.remove('hidden');
            differentMessage.classList.remove('hidden');
        }
    } else {
        revealBtn.classList.remove('hidden');
        finalizeBtn.classList.add('hidden');
        revoteBtn.classList.add('hidden');
        differentMessage.classList.add('hidden');
    }

    if (selectedTask.status === 'completed') {
        revealBtn.classList.add('hidden');
        finalizeBtn.classList.add('hidden');
        revoteBtn.classList.add('hidden');
        differentMessage.classList.add('hidden');
    }
}

// Révéler les votes
async function revealVotes() {
    if (!selectedTask || !isCreator) return;

    try {
        const response = await fetch(`${API_URL}/rooms/${currentRoom.id}/userstories/${selectedTask.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ revealed: true })
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la révélation des votes');
        }

        selectedTask.revealed = true;
        renderParticipantsVotes();
        updateCreatorButtons();
        updateCardsState();

    } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible de révéler les votes');
    }
}

// Relancer le vote
async function revote() {
    if (!selectedTask || !isCreator) return;

    const confirmed = confirm('Relancer le vote ? Tous les votes actuels seront effacés.');
    if (!confirmed) return;

    try {
        const response = await fetch(`${API_URL}/rooms/${currentRoom.id}/userstories/${selectedTask.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                revealed: false,
                votes: {}
            })
        });

        if (!response.ok) {
            throw new Error('Erreur lors du relancement du vote');
        }

        // Réinitialiser localement
        selectedTask.revealed = false;
        selectedTask.votes = {};

        renderParticipantsVotes();
        updateCreatorButtons();
        updateCardsState();

    } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible de relancer le vote');
    }
}

// Finaliser le vote
async function finalizeVote() {
    if (!selectedTask || !isCreator) return;

    // Calculer le vote moyen (ou demander au créateur)
    const votes = Object.values(selectedTask.votes || {});
    if (votes.length === 0) {
        alert('Aucun vote à finaliser');
        return;
    }

    // Vérifier que tous les votes sont identiques
    const allSame = votes.every(vote => vote === votes[0]);
    if (!allSame) {
        alert('Les votes ne sont pas unanimes. Veuillez relancer le vote.');
        return;
    }

    const finalVote = votes[0];

    // Demander confirmation
    const confirmed = confirm(`Finaliser cette tâche avec le vote: ${finalVote} ?`);
    if (!confirmed) return;

    try {
        const response = await fetch(`${API_URL}/rooms/${currentRoom.id}/userstories/${selectedTask.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                final_vote: finalVote,
                status: 'completed'
            })
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la finalisation');
        }

        selectedTask.final_vote = finalVote;
        selectedTask.status = 'completed';

        renderTasksList();
        showVotingInterface();

    } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible de finaliser la tâche');
    }
}// Copier le code de la salle
function copyRoomCode() {
    const roomCode = document.getElementById('roomCode').textContent;

    navigator.clipboard.writeText(roomCode).then(() => {
        // Afficher le feedback
        const feedback = document.getElementById('copyFeedback');
        feedback.classList.add('show');

        setTimeout(() => {
            feedback.classList.remove('show');
        }, 2000);
    }).catch(err => {
        console.error('Erreur lors de la copie:', err);
        alert('Impossible de copier le code');
    });
}

// Ajouter une nouvelle tâche
async function addTask() {
    const title = document.getElementById('taskTitle').value.trim();

    if (!title) {
        alert('Veuillez entrer un titre');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/rooms/${currentRoom.id}/userstories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ title: title })
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la création de la tâche');
        }

        const newTask = await response.json();
        tasks[newTask.id] = newTask;

        // Réinitialiser le formulaire
        document.getElementById('taskTitle').value = '';
        document.getElementById('addTaskForm').classList.add('hidden');
        document.getElementById('addTaskBtn').style.display = 'flex';

        // Mettre à jour l'affichage
        renderTasksList();

        // Sélectionner automatiquement la nouvelle tâche
        selectTask(newTask);

    } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible de créer la tâche');
    }
}

// Démarrer le polling pour synchroniser les données
function startPolling(roomId) {
    // Polling toutes les 2 secondes
    pollingInterval = setInterval(async () => {
        await loadTasks();
    }, 2000);
}

// Arrêter le polling (utile lors du nettoyage)
function stopPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
}

// Nettoyer lors de la fermeture de la page
window.addEventListener('beforeunload', () => {
    stopPolling();
});

// Initialiser les événements
function initializeEvents() {
    // Copier le code
    document.getElementById('copyCodeBtn').addEventListener('click', copyRoomCode);

    // Ajouter une tâche
    document.getElementById('addTaskBtn').addEventListener('click', () => {
        document.getElementById('addTaskForm').classList.remove('hidden');
        document.getElementById('addTaskBtn').style.display = 'none';
        document.getElementById('taskTitle').focus();
    });

    document.getElementById('submitTaskBtn').addEventListener('click', addTask);

    document.getElementById('cancelTaskBtn').addEventListener('click', () => {
        document.getElementById('addTaskForm').classList.add('hidden');
        document.getElementById('addTaskBtn').style.display = 'flex';
        document.getElementById('taskTitle').value = '';
    });

    // Soumettre avec Enter
    document.getElementById('taskTitle').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Actions du créateur
    document.getElementById('revealVotesBtn').addEventListener('click', revealVotes);
    document.getElementById('finalizeVoteBtn').addEventListener('click', finalizeVote);
    document.getElementById('revoteBtn').addEventListener('click', revote);
}
