// Récupérer le pseudo depuis localStorage (si stocké)
const pseudo = localStorage.getItem('playerName') || 'Utilisateur';
document.getElementById('welcomeMessage').textContent = `Bienvenue ${pseudo} ! Choisissez une option`;

// Gestion du formulaire de création de salle
document.getElementById('createForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const roomName = document.getElementById('roomName').value.trim();
    
    if (roomName) {
        console.log('Création de la salle :', roomName);
        alert(`Salle "${roomName}" créée ! (Backend non connecté pour le moment)`);
        
        // Plus tard, appel au backend :
        // fetch('http://127.0.0.1:5000/rooms', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ name: roomName })
        // })
    }
});

// Gestion du formulaire pour rejoindre une salle
document.getElementById('joinForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const roomCode = document.getElementById('roomCode').value.trim().toUpperCase();
    
    if (roomCode) {
        console.log('Rejoindre la salle avec le code :', roomCode);
        alert(`Tentative de rejoindre la salle ${roomCode} ! (Backend non connecté pour le moment)`);
        
        // Plus tard, appel au backend :
        // fetch(`http://127.0.0.1:5000/rooms/${roomCode}`)
        // puis fetch(`http://127.0.0.1:5000/rooms/${roomCode}/players`, ...)
    }
});

// Forcer la mise en majuscule du code de salle
document.getElementById('roomCode').addEventListener('input', function(e) {
    e.target.value = e.target.value.toUpperCase();
});
