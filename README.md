# TSPark - API de Gestion de Salles de Sport

### 1. Installation
```bash
# Installer les dépendances
npm install

# Créer la base de données
createdb tspark_db

# Lancer le serveur
npm run dev
```

### 2. Configuration
Créer un fichier `.env` avec :
```bash
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=votre_mot_de_passe
DB_DATABASE=tspark_db
JWT_SECRET=votre-clé-secrète
```

## 📋 Fonctionnalités

### 🔐 Authentification
- Inscription utilisateur (client, propriétaire de salle, admin)
- Connexion avec token JWT
- Gestion des rôles et permissions

### Gestion des Salles
- Créer une salle (propriétaire uniquement)
- Approuver/rejeter les salles (admin uniquement)
- Lister les salles approuvées
- Gérer les équipements et capacité

### Défis
- Créer des défis dans les salles
- Rejoindre/quitter des défis
- Suivre la progression des participants
- Système de points et récompenses

### Utilisateurs
- Profils utilisateur complets
- Gestion des permissions par rôle
- Statistiques et historique

## Structure du Code

```
src/
├── models/         # Entités de base de données
├── controllers/    # Gestion des requêtes HTTP
├── services/       # Logique métier
├── routes/         # Routes de l'API
├── middleware/     # Authentification et autorisations
└── config/         # Configuration base de données
```

## 🧪 Tests avec Postman

**Importer la collection** `postman/ilia-Personne-2.json`

## 🎛️ Commandes Utiles

```bash
npm run dev      # Démarrer en mode développement
npm run build    # Compiler pour la production
npm start        # Démarrer la version compilée
```

## 🔑 Rôles Utilisateur

- **`super_admin`** : Gère tout le système
- **`gym_owner`** : Crée et gère ses salles
- **`client`** : Participe aux défis
