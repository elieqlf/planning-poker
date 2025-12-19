
---

# Planning Poker

### Projet – Conception Agile

**Auteurs :**

* LORENZO Quentin
* CALVIERE Elie

---

## Installation de l’environnement virtuel

### 1. Créer l’environnement virtuel

```bash
python3 -m venv .venv
```

### 2. Activer l’environnement virtuel

```bash
source .venv/bin/activate
```

---

## Installation des dépendances

```bash
pip install -r server/requirements.txt
```

---

## Lancement de l'application

Il faut d'abord lancer le serveur avec l'api et après lancer le frontend. Il est possible de lancer plusieurs fois le frontend sur plusieurs pages de différent navigateur afin de faire le planning poker à plusieurs sur la même room.
Par exemple une page sur chrome et une autre sur firefox. Ou alors les deux sur le meme navigateur mais avec une fenetre en navigation privé.

### Démarrer le serveur backend

```bash
cd ./server && source venv/bin/activate && python app.py
```

Le serveur sera accessible sur `http://127.0.0.1:5000`

### Démarrer le client frontend

```bash
cd ./client && python3 -m http.server 8000
```

Le client sera accessible sur `http://localhost:8000`

---

## Fonctionnalités

### Authentification JWT
- Chaque joueur crée un compte avec un pseudo
- Un token JWT est généré et utilisé pour toutes les requêtes API
- Le token est stocké dans le localStorage du navigateur

### Gestion des salles (Rooms)
- **Créer une salle** : Le premier joueur devient le créateur
- **Rejoindre une salle** : Utiliser le code de 6 caractères
- **Code partageable** : Bouton de copie rapide du code

### User Stories et votes
- **Création de user stories** : Le créateur peut ajouter des tâches à estimer
- **Vote avec cartes Poker** : Valeurs disponibles : 0, 1/2, 1, 2, 3, 5, 8, 13, 20, 40, 100, ?
- **Synchronisation en temps réel** : Polling toutes les 2 secondes pour voir les votes des autres

### Processus de vote unanime
1. Tous les joueurs votent sur une user story
2. Le créateur révèle les votes
3. **Si les votes sont unanimes** → Le créateur peut finaliser la tâche avec cette estimation
4. **Si les votes sont différents** → Un message d'avertissement apparaît et le créateur doit relancer le vote
5. Le processus se répète jusqu'à obtenir un consensus unanime

### Relancer le vote
- Bouton "Relancer le vote" disponible quand les votes ne sont pas unanimes
- Efface tous les votes actuels
- Permet une nouvelle discussion et un nouveau tour de vote
- Le processus continue jusqu'à ce que tous les joueurs soient d'accord sur la même estimation

---

## Technologies utilisées

### Backend
- Flask 3.0.3
- Flask-CORS 5.0.0
- PyJWT 2.10.1
- Python-dotenv 1.2.1

### Frontend
- HTML5
- CSS3 (design moderne avec gradients)
- JavaScript vanilla (ES6+)
- Fetch API pour les appels REST

---
