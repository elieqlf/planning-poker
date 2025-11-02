// Gestion du formulaire de pseudo
document.getElementById('pseudoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const pseudo = document.getElementById('pseudo').value.trim();
    
    if (pseudo) {
        console.log('Pseudo saisi :', pseudo);
        
        // Sauvegarder le pseudo dans localStorage
        localStorage.setItem('playerName', pseudo);
        
        // Rediriger vers la page de choix de salle
        window.location.href = 'room-choice.html';
        
        // Ici, plus tard, on pourra faire appel au backend
        // fetch('http://127.0.0.1:5000/rooms/<room_id>/players', { ... })
    }
});

// Animation au survol du bouton
const submitBtn = document.querySelector('.btn-primary');
submitBtn.addEventListener('mouseenter', function() {
    this.style.background = 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)';
});

submitBtn.addEventListener('mouseleave', function() {
    this.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
});
