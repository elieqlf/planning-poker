"""
Middleware pour l'authentification JWT
"""
from flask import request, jsonify
from functools import wraps
import jwt
import os
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv('SECRET_KEY')

def token_required(f):
    """
    Décorateur pour protéger les routes avec authentification JWT
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Récupère le token depuis le header Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                # Format attendu: "Bearer <token>"
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({
                    'error': 'Format du token invalide. Utilisez: Bearer <token>'
                }), 401

        if not token:
            return jsonify({
                'error': 'Token manquant. Authentification requise.'
            }), 401

        try:
            # Décode et vérifie le token
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            # Ajoute l'ID du joueur actuel dans kwargs pour l'utiliser dans la route
            kwargs['current_user_id'] = payload['id']
        except jwt.ExpiredSignatureError:
            return jsonify({
                'error': 'Le token a expiré'
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                'error': 'Token invalide'
            }), 401

        return f(*args, **kwargs)
    
    return decorated
