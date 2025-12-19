// Configuration
const API_URL = 'http://127.0.0.1:5000';

// Gestion du formulaire de pseudo
document.getElementById('pseudoForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const pseudo = document.getElementById('pseudo').value.trim();

    if (pseudo) {
        try {
            // Appel à l'API pour créer le joueur et obtenir le token
            const response = await fetch(`${API_URL}/players/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: pseudo })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la création du joueur');
            }

            const data = await response.json();

            // Sauvegarder le token et le nom dans localStorage
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('playerName', pseudo);

            console.log('Joueur créé avec succès, token reçu');

            // Rediriger vers la page de choix de salle
            window.location.href = 'room-choice.html';

        } catch (error) {
            console.error('Erreur:', error);
            alert('Impossible de créer votre profil. Vérifiez que le serveur est démarré.');
        }
    }
});

// Animation au survol du bouton
const submitBtn = document.querySelector('.btn-primary');
submitBtn.addEventListener('mouseenter', function () {
    this.style.background = 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)';
});

submitBtn.addEventListener('mouseleave', function () {
    this.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
});
