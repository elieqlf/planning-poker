// Configuration
const API_URL = 'http://127.0.0.1:5000';
const POKER_VALUES = ['0', '1/2', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?'];

// État de l'application
let currentRoom = null;
let currentPlayer = null;
let selectedTask = null;
let isCreator = false;
let tasks = {};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Récupérer les informations de la room depuis l'URL ou localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room') || localStorage.getItem('currentRoom');
    const playerId = localStorage.getItem('playerId');
    const playerName = localStorage.getItem('playerName');
    
    if (!roomId) {
        alert('Aucune salle spécifiée');
        window.location.href = 'room-choice.html';
        return;
    }

    currentPlayer = {
        id: playerId || generatePlayerId(),
        name: playerName || 'Joueur'
    };

    // Sauvegarder l'ID du joueur
    if (!playerId) {
        localStorage.setItem('playerId', currentPlayer.id);
    }

    // Charger la salle
    loadRoom(roomId);

    // Initialiser les événements
    initializeEvents();

    // Générer les cartes de poker
    generatePokerCards();
});

// Générer un ID de joueur unique
function generatePlayerId() {
    return 'player_' + Math.random().toString(36).substr(2, 9);
}

// Charger les informations de la salle
async function loadRoom(roomId) {
    try {
        // Simuler le chargement (à remplacer par un vrai appel API)
        currentRoom = {
            id: roomId,
            name: 'Ma salle de Planning Poker',
            creator_id: currentPlayer.id, // Pour la démo, le joueur est le créateur
            stories: {}
        };

        isCreator = currentRoom.creator_id === currentPlayer.id;

        // Mettre à jour l'interface
        document.getElementById('roomName').textContent = currentRoom.name;
        document.getElementById('roomCode').textContent = roomId;

        // Afficher/masquer le bouton d'ajout de tâche selon le rôle
        if (!isCreator) {
            document.getElementById('addTaskBtn').style.display = 'none';
            document.getElementById('creatorActions').style.display = 'none';
        }

        // Charger les tâches
        loadTasks();

        /* Code réel pour appeler l'API :
        const response = await fetch(`${API_URL}/rooms/${roomId}`);
        if (!response.ok) throw new Error('Salle introuvable');
        currentRoom = await response.json();
        // ... reste du code
        */
    } catch (error) {
        console.error('Erreur lors du chargement de la salle:', error);
        alert('Impossible de charger la salle');
        window.location.href = 'room-choice.html';
    }
}

// Charger les tâches
function loadTasks() {
    tasks = currentRoom.stories || {};
    renderTasksList();
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
function selectTask(task) {
    selectedTask = task;
    renderTasksList();
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
function voteForCard(value) {
    if (!selectedTask) return;
    if (selectedTask.status === 'completed') return;

    // Mettre à jour le vote local
    if (!selectedTask.votes) {
        selectedTask.votes = {};
    }
    selectedTask.votes[currentPlayer.id] = value;

    // Mettre à jour l'affichage
    updateCardsState();
    renderParticipantsVotes();

    /* Code réel pour appeler l'API :
    fetch(`${API_URL}/rooms/${currentRoom.id}/userstories/${selectedTask.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            player_id: currentPlayer.id,
            vote: value
        })
    });
    */
}

// Mettre à jour l'état des cartes
function updateCardsState() {
    const cards = document.querySelectorAll('.poker-card');
    const myVote = selectedTask.votes?.[currentPlayer.id];

    cards.forEach(card => {
        const value = card.dataset.value;
        card.classList.remove('selected', 'disabled');

        if (myVote === value) {
            card.classList.add('selected');
        }

        if (selectedTask.status === 'completed' || selectedTask.revealed) {
            // Désactiver les cartes si la tâche est terminée ou révélée
            if (!myVote || myVote !== value) {
                card.classList.add('disabled');
            }
        }
    });
}

// Afficher les votes des participants
function renderParticipantsVotes() {
    const container = document.getElementById('participantsList');
    container.innerHTML = '';

    // Pour la démo, afficher le vote du joueur actuel
    const votes = selectedTask.votes || {};
    
    if (Object.keys(votes).length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Aucun vote pour le moment</p>';
        return;
    }

    // Afficher tous les votes
    Object.entries(votes).forEach(([playerId, vote]) => {
        const playerName = playerId === currentPlayer.id ? currentPlayer.name + ' (Vous)' : 'Joueur ' + playerId.slice(-4);
        const card = createParticipantCard(playerName, vote, selectedTask.revealed);
        container.appendChild(card);
    });
}

// Créer une carte de participant
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

    if (selectedTask.revealed) {
        revealBtn.classList.add('hidden');
        finalizeBtn.classList.remove('hidden');
    } else {
        revealBtn.classList.remove('hidden');
        finalizeBtn.classList.add('hidden');
    }

    if (selectedTask.status === 'completed') {
        revealBtn.classList.add('hidden');
        finalizeBtn.classList.add('hidden');
    }
}

// Révéler les votes
function revealVotes() {
    if (!selectedTask || !isCreator) return;

    selectedTask.revealed = true;
    renderParticipantsVotes();
    updateCreatorButtons();
    updateCardsState();

    /* Code réel pour appeler l'API :
    fetch(`${API_URL}/rooms/${currentRoom.id}/userstories/${selectedTask.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revealed: true })
    });
    */
}

// Finaliser le vote
function finalizeVote() {
    if (!selectedTask || !isCreator) return;

    // Calculer le vote moyen (ou demander au créateur)
    const votes = Object.values(selectedTask.votes || {});
    if (votes.length === 0) {
        alert('Aucun vote à finaliser');
        return;
    }

    // Pour simplifier, prendre le vote le plus commun
    const voteCounts = {};
    votes.forEach(vote => {
        voteCounts[vote] = (voteCounts[vote] || 0) + 1;
    });

    const finalVote = Object.keys(voteCounts).reduce((a, b) => 
        voteCounts[a] > voteCounts[b] ? a : b
    );

    // Demander confirmation
    const confirmed = confirm(`Finaliser cette tâche avec le vote: ${finalVote} ?`);
    if (!confirmed) return;

    selectedTask.final_vote = finalVote;
    selectedTask.status = 'completed';

    renderTasksList();
    showVotingInterface();

    /* Code réel pour appeler l'API :
    fetch(`${API_URL}/rooms/${currentRoom.id}/userstories/${selectedTask.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            final_vote: finalVote,
            status: 'completed'
        })
    });
    */
}

// Copier le code de la salle
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
function addTask() {
    const title = document.getElementById('taskTitle').value.trim();
    
    if (!title) {
        alert('Veuillez entrer un titre');
        return;
    }

    // Créer la tâche
    const taskId = String(Object.keys(tasks).length + 1);
    const newTask = {
        id: taskId,
        title: title,
        status: 'pending',
        votes: {},
        revealed: false,
        final_vote: null
    };

    tasks[taskId] = newTask;
    currentRoom.stories = tasks;

    // Réinitialiser le formulaire
    document.getElementById('taskTitle').value = '';
    document.getElementById('addTaskForm').classList.add('hidden');
    document.getElementById('addTaskBtn').style.display = 'flex';

    // Mettre à jour l'affichage
    renderTasksList();

    // Sélectionner automatiquement la nouvelle tâche
    selectTask(newTask);

    /* Code réel pour appeler l'API :
    fetch(`${API_URL}/rooms/${currentRoom.id}/userstories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title })
    })
    .then(response => response.json())
    .then(task => {
        tasks[task.id] = task;
        renderTasksList();
        selectTask(task);
    });
    */
}

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
}
