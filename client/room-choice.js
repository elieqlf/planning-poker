// Récupérer le pseudo depuis localStorage (si stocké)
const pseudo = localStorage.getItem('playerName') || 'Utilisateur';
document.getElementById('welcomeMessage').textContent = `Bienvenue ${pseudo} ! Choisissez une option`;

// Gestion du formulaire de création de salle
document.getElementById('createForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const roomName = document.getElementById('roomName').value.trim();
    
    if (roomName) {
        console.log('Création de la salle :', roomName);
        
        // Pour la démo, générer un code de salle
        const roomCode = generateRoomCode();
        localStorage.setItem('currentRoom', roomCode);
        
        // Rediriger vers la page de la salle
        window.location.href = `room.html?room=${roomCode}`;
        
        // Plus tard, appel au backend :
        // fetch('http://127.0.0.1:5000/rooms', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ name: roomName })
        // })
        // .then(response => response.json())
        // .then(data => {
        //     localStorage.setItem('currentRoom', data.room_id);
        //     window.location.href = `room.html?room=${data.room_id}`;
        // });
    }
});

// Gestion du formulaire pour rejoindre une salle
document.getElementById('joinForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const roomCode = document.getElementById('roomCode').value.trim().toUpperCase();
    
    if (roomCode) {
        console.log('Rejoindre la salle avec le code :', roomCode);
        localStorage.setItem('currentRoom', roomCode);
        
        // Rediriger vers la page de la salle
        window.location.href = `room.html?room=${roomCode}`;
        
        // Plus tard, appel au backend :
        // fetch(`http://127.0.0.1:5000/rooms/${roomCode}`)
        // .then(response => response.json())
        // .then(data => {
        //     localStorage.setItem('currentRoom', roomCode);
        //     window.location.href = `room.html?room=${roomCode}`;
        // });
    }
});

// Forcer la mise en majuscule du code de salle
document.getElementById('roomCode').addEventListener('input', function(e) {
    e.target.value = e.target.value.toUpperCase();
});

// Fonction pour générer un code de salle (6 caractères)
function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
