# TSPark - Plateforme API de Challenges Fitness

Une API RESTful pour la gestion de salles de sport, de challenges fitness, d'entrainements, de badges et de fonctionnalites sociales. Construite avec TypeScript, Express 5, TypeORM et PostgreSQL.

---

## Table des matieres

- [Demarrage rapide](#demarrage-rapide)
- [Installation avec Docker](#installation-avec-docker)
- [Installation locale](#installation-locale)
- [Variables d'environnement](#variables-denvironnement)
- [Commandes disponibles](#commandes-disponibles)
- [Structure du projet](#structure-du-projet)
- [Documentation API](#documentation-api)
- [Tests avec Postman](#tests-avec-postman)
- [Roles et permissions](#roles-et-permissions)
- [Apercu des fonctionnalites](#apercu-des-fonctionnalites)
- [Gestion de la base de donnees](#gestion-de-la-base-de-donnees)
- [Depannage](#depannage)
- [Stack technique](#stack-technique)

---

## Demarrage rapide

```bash
git clone <repository-url>
cd ts-park
npm install                        # Installer les dependances
docker-compose up -d --build       # Demarrer tous les services
docker-compose exec app npm run seed  # Initialiser la base de donnees
```

**Points d'acces :**

- **API** : http://localhost:3000
- **Documentation Swagger** : http://localhost:3000/api/docs
- **Adminer (Interface BDD)** : http://localhost:8080

**Importer la collection Postman (pour tester l'API) :**

1. Ouvrir Postman
2. Cliquer sur **Import** (en haut a gauche)
3. Glisser-deposer ou parcourir vers : `postman/tspark-api-collection.json`
4. Commencer a tester avec les requetes pre-configurees !

---

## Installation avec Docker

Docker est la methode recommandee pour executer TSPark.

### Prerequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installe et en cours d'execution

### Configuration

```bash
# 1. Installer les dependances (requis avant la construction Docker)
npm install

# 2. Construire et demarrer tous les services
docker-compose up -d --build

# 3. Initialiser la base de donnees avec les donnees de test
docker-compose exec app npm run seed
```

### Utilisateurs de test (crees par le seed)

| Email | Mot de passe | Role |
|-------|--------------|------|
| admin@tspark.com | SuperAdmin123! | Super Admin |
| gymowner@tspark.com | GymOwner123! | Proprietaire de salle |
| client1@tspark.com | Client123! | Client |
| client2@tspark.com | Client123! | Client |

### Commandes Docker essentielles

```bash
docker-compose up -d --build     # Demarrer les services
docker-compose logs -f app       # Voir les logs
docker-compose down              # Arreter les services
docker-compose down -v           # Arreter et reinitialiser la BDD
```

### Importer la collection Postman (Recommande pour les tests)

Pour des tests API complets, importez notre collection Postman pre-configuree :

1. Ouvrir **Postman**
2. Cliquer sur **Import** (coin superieur gauche)
3. Selectionner le fichier : `postman/tspark-api-collection.json`
4. La collection inclut :
   - Tous les endpoints pre-configures avec variables
   - Gestion automatique des tokens (connexion unique, tokens auto-sauvegardes)
   - Flux de test sequentiel (dossiers 0-9 dans l'ordre)
   - Scripts pre-requete pour les donnees dynamiques

**Pourquoi Postman plutot que Swagger ?**
- Gestion automatique des tokens JWT entre les requetes
- Variables de collection pour les IDs (salle, challenge, entrainement, etc.)
- Executer des flux de test complets avec le Collection Runner
- Meilleur pour tester des parcours utilisateur complets

---

## Installation locale

Si vous preferez executer sans Docker :

### Prerequis

- Node.js 18+ installe
- PostgreSQL 16+ en cours d'execution localement
- npm ou yarn

### Etape 1 : Installer les dependances

```bash
npm install
```

### Etape 2 : Configurer l'environnement

```bash
# Copier le fichier d'environnement exemple
cp .env.example .env

# Modifier .env avec vos identifiants PostgreSQL locaux
# Changer DB_HOST de 'postgres' a 'localhost'
```

### Etape 3 : Configurer la base de donnees

```bash
# Executer les migrations
npm run migration:run

# Initialiser les donnees
npm run seed
```

### Etape 4 : Demarrer le serveur de developpement

```bash
npm run dev
```

L'API demarrera sur http://localhost:3000 avec le rechargement automatique active.

---

## Variables d'environnement

Creer un fichier `.env` avec ces variables :

```bash
# ===================
# Configuration serveur
# ===================
NODE_ENV=development
PORT=3000
API_PREFIX=/api

# ===================
# Base de donnees (PostgreSQL)
# ===================
DB_HOST=postgres          # Utiliser 'localhost' pour le dev local
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=tspark_db

# ===================
# Authentification (JWT)
# ===================
JWT_SECRET=votre-cle-secrete-a-changer-en-production
JWT_EXPIRES_IN=24h

# ===================
# Super Admin (cree au premier demarrage)
# ===================
SUPER_ADMIN_EMAIL=admin@tspark.com
SUPER_ADMIN_PASSWORD=SuperAdmin123!

# ===================
# Email (Optionnel en dev)
# ===================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre-email@gmail.com
EMAIL_PASSWORD=votre-mot-de-passe-application
EMAIL_FROM=noreply@tspark.com

# ===================
# URLs
# ===================
FRONTEND_URL=http://localhost:3000
APP_URL=http://localhost:3000

# ===================
# Limitation de requetes
# ===================
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Commandes disponibles

| Commande              | Description                              |
| --------------------- | ---------------------------------------- |
| `npm run dev`         | Demarrer le serveur de dev avec rechargement auto |
| `npm run build`       | Compiler TypeScript en JavaScript        |
| `npm run seed`        | Initialiser la BDD avec les donnees      |
| `npm run migration:run` | Executer les migrations en attente     |

**Dans Docker :** Prefixer toute commande avec `docker-compose exec app`

---

## Structure du projet

```
ts-park/
├── docker/                    # Fichiers de configuration Docker
│   ├── postgres/init.sql      # Initialisation de la BDD
│   └── scripts/entrypoint.sh  # Script de demarrage du conteneur
├── postman/                   # Collection API Postman
│   └── tspark-api-collection.json
├── src/
│   ├── config/                # Configuration BDD & application
│   │   ├── database.ts        # Configuration TypeORM
│   │   └── swagger.ts         # Configuration Swagger/OpenAPI
│   ├── controllers/           # Gestionnaires de requetes HTTP
│   │   ├── auth.controller.ts
│   │   ├── badge.controller.ts
│   │   ├── challenge.controller.ts
│   │   ├── exercise.controller.ts
│   │   ├── gym.controller.ts
│   │   ├── notification.controller.ts
│   │   ├── social.controller.ts
│   │   ├── user.controller.ts
│   │   └── workout.controller.ts
│   ├── database/              # Migrations et seeders
│   ├── dtos/                  # Objets de transfert de donnees (validation)
│   ├── middleware/            # Middleware Express
│   │   ├── auth.middleware.ts # Authentification JWT
│   │   ├── error.middleware.ts # Gestion globale des erreurs
│   │   └── validate.middleware.ts
│   ├── models/                # Entites TypeORM
│   │   ├── Badge.ts
│   │   ├── BadgeRule.ts
│   │   ├── Challenge.ts
│   │   ├── Exercise.ts
│   │   ├── Friendship.ts
│   │   ├── Gym.ts
│   │   ├── Notification.ts
│   │   ├── Participation.ts
│   │   ├── User.ts
│   │   ├── UserBadge.ts
│   │   ├── Workout.ts
│   │   └── WorkoutExercice.ts
│   ├── routes/                # Definitions des routes API
│   ├── services/              # Couche logique metier
│   ├── types/                 # Types TypeScript & enums
│   ├── utils/                 # Utilitaires
│   │   ├── jwt.ts
│   │   ├── tokens.ts
│   │   └── response.ts
│   ├── app.ts                 # Configuration Express
│   └── server.ts              # Point d'entree du serveur
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json
```

---

## Documentation API

### Documentation interactive

**Swagger UI** est disponible sur : http://localhost:3000/api/docs

### URL de base de l'API

Tous les endpoints API sont prefixes par `/api` :

```
http://localhost:3000/api
```

### Resume des endpoints

#### Authentification (`/api/auth`)

| Methode | Endpoint                       | Description                | Auth |
| ------- | ------------------------------ | -------------------------- | ---- |
| POST    | `/auth/register`               | Creer un nouveau compte    | Non  |
| POST    | `/auth/login`                  | Obtenir un token JWT       | Non  |
| GET     | `/auth/me`                     | Obtenir l'utilisateur actuel | Oui  |
| POST    | `/auth/logout`                 | Invalider le token         | Oui  |
| GET     | `/auth/verify-email?token=xxx` | Verifier l'email           | Non  |
| POST    | `/auth/resend-verification`    | Renvoyer la verification   | Oui  |
| POST    | `/auth/forgot-password`        | Demander reinit. mot de passe | Non  |
| POST    | `/auth/reset-password`         | Reinitialiser avec token   | Non  |

#### Utilisateurs (`/api/users`) - Super Admin uniquement

| Methode | Endpoint           | Description            |
| ------- | ------------------ | ---------------------- |
| GET     | `/users`           | Lister tous les utilisateurs |
| GET     | `/users/:id`       | Obtenir un utilisateur par ID |
| GET     | `/users/:id/stats` | Obtenir les statistiques |
| PATCH   | `/users/:id/role`  | Modifier le role       |
| DELETE  | `/users/:id`       | Desactiver l'utilisateur |

#### Exercices (`/api/exercises`)

| Methode | Endpoint                    | Description       | Role          |
| ------- | --------------------------- | ----------------- | ------------- |
| POST    | `/exercises`                | Creer un exercice | Super Admin   |
| GET     | `/exercises`                | Lister les exercices | Authentifie   |
| GET     | `/exercises/search?q=query` | Rechercher        | Authentifie   |
| GET     | `/exercises/:id`            | Obtenir un exercice | Authentifie   |
| PATCH   | `/exercises/:id`            | Modifier          | Super Admin   |
| DELETE  | `/exercises/:id`            | Supprimer (soft)  | Super Admin   |
| GET     | `/exercises/deleted`        | Lister les supprimes | Super Admin   |
| POST    | `/exercises/:id/restore`    | Restaurer         | Super Admin   |

#### Salles de sport (`/api/gyms`)

| Methode | Endpoint              | Description              | Role          |
| ------- | --------------------- | ------------------------ | ------------- |
| POST    | `/gyms`               | Creer une salle (EN ATTENTE) | Proprietaire  |
| GET     | `/gyms`               | Lister les salles        | Authentifie   |
| GET     | `/gyms/:id`           | Details de la salle      | Authentifie   |
| GET     | `/gyms/owner/:userId` | Salles par proprietaire  | Authentifie   |
| PATCH   | `/gyms/:id`           | Modifier la salle        | Proprietaire  |
| PATCH   | `/gyms/:id/approve`   | Approuver la salle       | Super Admin   |

#### Challenges (`/api/challenges`)

| Methode | Endpoint                        | Description         | Role          |
| ------- | ------------------------------- | ------------------- | ------------- |
| POST    | `/challenges`                   | Creer (BROUILLON)   | Proprietaire  |
| GET     | `/challenges`                   | Lister les challenges | Authentifie   |
| GET     | `/challenges/:id`               | Obtenir un challenge | Authentifie   |
| POST    | `/challenges/:id/start`         | Demarrer le challenge | Createur      |
| POST    | `/challenges/:id/join`          | Rejoindre           | Client        |
| POST    | `/challenges/:id/leave`         | Quitter             | Client        |
| GET     | `/challenges/my-participations` | Mes participations  | Client        |
| GET     | `/challenges/:id/participants`  | Lister participants | Authentifie   |
| PATCH   | `/challenges/:id`               | Modifier            | Createur      |
| POST    | `/challenges/:id/complete`      | Terminer            | Createur      |
| POST    | `/challenges/:id/cancel`        | Annuler             | Createur      |
| DELETE  | `/challenges/:id`               | Supprimer (soft)    | Createur      |

#### Entrainements (`/api/workouts`)

| Methode | Endpoint               | Description            |
| ------- | ---------------------- | ---------------------- |
| POST    | `/workouts`            | Enregistrer un entrainement |
| GET     | `/workouts`            | Mes entrainements      |
| GET     | `/workouts/:id`        | Details de l'entrainement |
| GET     | `/workouts/statistics` | Mes statistiques       |
| PATCH   | `/workouts/:id`        | Modifier               |
| DELETE  | `/workouts/:id`        | Supprimer              |

#### Badges (`/api/badges`)

| Methode | Endpoint            | Description        | Role          |
| ------- | ------------------- | ------------------ | ------------- |
| POST    | `/badges`           | Creer un badge     | Super Admin   |
| GET     | `/badges`           | Mes badges         | Authentifie   |
| GET     | `/badges/available` | Tous les badges actifs | Authentifie   |
| GET     | `/badges/:id`       | Details du badge   | Super Admin   |
| POST    | `/badges/:id/rules` | Creer une regle    | Super Admin   |
| GET     | `/badges/:id/rules` | Obtenir les regles | Super Admin   |
| POST    | `/badges/assign`    | Attribuer a un utilisateur | Super Admin   |
| DELETE  | `/badges/rules/:id` | Supprimer une regle | Super Admin   |
| DELETE  | `/badges/:id`       | Supprimer (soft)   | Super Admin   |

#### Amis (`/api/friends`)

| Methode | Endpoint                  | Description         |
| ------- | ------------------------- | ------------------- |
| GET     | `/friends`                | Lister les amis     |
| GET     | `/friends/pending`        | Demandes en attente |
| GET     | `/friends/sent`           | Demandes envoyees   |
| GET     | `/friends/status/:userId` | Statut de l'amitie  |
| POST    | `/friends/request`        | Envoyer une demande |
| POST    | `/friends/:id/accept`     | Accepter            |
| POST    | `/friends/:id/reject`     | Refuser             |
| DELETE  | `/friends/:id`            | Supprimer un ami    |

#### Notifications (`/api/notifications`)

| Methode | Endpoint                       | Description          |
| ------- | ------------------------------ | -------------------- |
| GET     | `/notifications`               | Toutes les notifications |
| GET     | `/notifications/unread-count`  | Nombre non lues      |
| POST    | `/notifications/mark-all-read` | Marquer toutes lues  |

---

## Tests avec Postman

Le projet inclut une collection Postman complete avec des tests pre-configures et une gestion automatique des tokens.

### Etape 1 : Importer la collection

1. Ouvrir Postman
2. Cliquer sur le bouton **Import** (en haut a gauche)
3. Selectionner l'onglet **File**
4. Naviguer vers : `postman/tspark-api-collection.json`
5. Cliquer sur **Import**

### Etape 2 : Comprendre la structure de la collection

La collection est organisee dans un ordre sequentiel pour un flux de test complet :

```
0. Health Check           → Verifier que l'API fonctionne
1. Setup - Login Users    → Obtenir les tokens JWT pour tous les utilisateurs
2. Super Admin: Exercises → Creer des exercices (prerequis pour les challenges)
3. Gym Owner: Create Gym  → Creer une salle (statut EN ATTENTE)
4. Super Admin: Approve   → Approuver la salle (EN ATTENTE → APPROUVEE)
5. Gym Owner: Challenges  → Creer et demarrer des challenges
6. Client: Participate    → Rejoindre des challenges, enregistrer des entrainements
7. Social & Badges        → Demandes d'amis, badges
8. User Management        → Operations admin sur les utilisateurs
9. Auth Features          → Endpoints d'authentification supplementaires
99. Destructive Ops       → Operations DELETE (a executer manuellement)
```

### Etape 3 : Flux de test complet

**Prerequis :**

```bash
# S'assurer que les services fonctionnent
docker-compose up -d

# Initialiser la base de donnees (cree les utilisateurs de test)
docker-compose exec app npm run seed
```

**Executer le flux :**

1. **Health Check (Dossier 0)**
   - Executer `0.1 Health Check` pour verifier que l'API est accessible

2. **Login All Users (Dossier 1)**
   - Executer toutes les requetes de login (1.1 a 1.4)
   - Les tokens sont automatiquement sauvegardes dans les variables de collection
   - Executer `1.5 Verify Auth` pour confirmer que les tokens fonctionnent

3. **Create Exercises (Dossier 2)** - Super Admin
   - Executer `2.1` et `2.2` pour creer des exercices
   - Les IDs d'exercices sont auto-sauvegardes pour utilisation ulterieure

4. **Create Gym (Dossier 3)** - Proprietaire de salle
   - Executer `3.1 Create Gym`
   - Note : Le statut de la salle est EN ATTENTE

5. **Approve Gym (Dossier 4)** - Super Admin
   - Executer `4.1 Approve Gym` (ETAPE CRITIQUE !)
   - Changement de statut : EN ATTENTE → APPROUVEE

6. **Create Challenge (Dossier 5)** - Proprietaire de salle
   - Executer `5.1 Create Challenge` (statut : BROUILLON)
   - Executer `5.3 Start Challenge` (statut : ACTIF)
   - Maintenant les clients peuvent rejoindre !

7. **Client Participation (Dossier 6)**
   - Executer `6.2 Join Challenge`
   - Executer `6.4 Log Workout`
   - Executer `6.7 Get Statistics`

8. **Social Features (Dossier 7)**
   - Executer le flux de demande d'ami (7.1 → 7.4)
   - Creer et attribuer des badges

### Comprendre les variables de collection

La collection utilise des variables qui se mettent a jour automatiquement :

| Variable          | Definie par       | Utilisee pour         |
| ----------------- | ----------------- | --------------------- |
| `superAdminToken` | Login Super Admin | Header Authorization  |
| `gymOwnerToken`   | Login Proprietaire | Header Authorization  |
| `clientToken`     | Login Client 1    | Header Authorization  |
| `client2Token`    | Login Client 2    | Tests sociaux         |
| `gymId`           | Create Gym        | Creation de challenge |
| `exerciseId`      | Create Exercise   | Enregistrement entrainement |
| `challengeId`     | Create Challenge  | Operations join/leave |
| `workoutId`       | Log Workout       | Modifier/supprimer    |
| `friendshipId`    | Friend Request    | Accepter/refuser      |
| `badgeId`         | Create Badge      | Operations badge      |

### Executer les tests automatiquement

Vous pouvez executer des dossiers entiers avec le Collection Runner de Postman :

1. Cliquer sur les trois points a cote d'un dossier
2. Selectionner **Run folder**
3. Revoir et cliquer sur **Run**

---

## Roles et permissions

### Hierarchie des roles

```
Super Admin (le plus eleve)
    └── Proprietaire de salle
        └── Client (le plus bas)
```

### Super Admin

- Acces complet a la plateforme
- Creer et gerer les exercices
- Approuver/rejeter les inscriptions de salles
- Creer et gerer les badges
- Gerer tous les utilisateurs
- Voir toutes les donnees

### Proprietaire de salle

- Creer et gerer ses propres salles
- Creer des challenges pour les salles approuvees
- Voir les participants et la progression des challenges
- Ne peut pas creer d'exercices (Super Admin uniquement)

### Client

- Parcourir les salles et challenges
- Rejoindre les challenges actifs
- Enregistrer des entrainements
- Gagner des badges
- Fonctionnalites sociales (amis)

### Attribution des roles

Les nouveaux utilisateurs s'inscrivent en tant que **Client** par defaut. Le Super Admin peut promouvoir les utilisateurs :

```bash
PATCH /api/users/:id/role
{
  "role": "gym_owner"  # ou "super_admin"
}
```

---

## Apercu des fonctionnalites

### Systeme d'authentification

- Authentification basee sur JWT
- Flux de verification d'email
- Reinitialisation du mot de passe par email
- Liste noire des tokens a la deconnexion
- Protection par limitation de requetes

### Gestion des salles

- Creation de salle avec workflow d'approbation
- Statut : EN ATTENTE → APPROUVEE / REJETEE
- Suivi de l'equipement et des specialisations
- Gestion de la capacite

### Systeme de challenges

- Cycle de vie : BROUILLON → ACTIF → TERMINE / ANNULE
- Challenges individuels ou en equipe
- Niveaux de difficulte et recompenses en points
- Suivi de la progression
- Exercices recommandes

### Suivi des entrainements

- Enregistrer des entrainements avec exercices
- Suivre la duree, les calories, les series, les repetitions
- Calcul automatique de la progression
- Statistiques et analyses

### Systeme de badges

- Badges personnalises avec icones
- Attribution automatique basee sur des regles
- Attribution manuelle de badges
- Valeurs en points pour la gamification

### Fonctionnalites sociales

- Demandes d'amis et connexions
- Suivi du statut d'amitie
- Notifications sociales

---

## Gestion de la base de donnees

### Adminer (Interface BDD)

Accessible sur http://localhost:8080 avec :
- **Serveur** : postgres | **Utilisateur** : postgres | **Mot de passe** : postgres | **Base** : tspark_db

### Relations entre entites

```text
User ─── possede ──→ Gym ──→ Challenge ──→ Participation
  │                            │
  ├── enregistre ──→ Workout   └── recommendedExercises ──→ Exercise
  ├── gagne ──→ UserBadge ──→ Badge ──→ BadgeRule
  └── amis ──→ Friendship
```

---

## Depannage

| Probleme | Solution |
|----------|----------|
| Conteneurs ne demarrent pas | `docker-compose logs -f` pour voir les erreurs |
| Erreurs de connexion BDD | `docker-compose down -v` puis redemarrer |
| 401 Non autorise | Token expire - se reconnecter |
| 403 Interdit | Verifier les permissions de votre role |
| La salle ne peut pas creer de challenges | La salle doit d'abord etre APPROUVEE par le Super Admin |
| Impossible de rejoindre un challenge | Le challenge doit etre ACTIF (pas BROUILLON) |

---

## Stack technique

| Categorie            | Technologie                      |
| -------------------- | -------------------------------- |
| **Runtime**          | Node.js 18+                      |
| **Langage**          | TypeScript 5.x                   |
| **Framework**        | Express 5                        |
| **Base de donnees**  | PostgreSQL 16                    |
| **ORM**              | TypeORM 0.3                      |
| **Authentification** | JWT (jsonwebtoken)               |
| **Hashage MDP**      | bcryptjs                         |
| **Validation**       | class-validator                  |
| **Email**            | Nodemailer                       |
| **Securite**         | Helmet, CORS, express-rate-limit |
| **Documentation**    | Swagger/OpenAPI                  |
| **Conteneurisation** | Docker & Docker Compose          |

---

## Licence

ISC

---

## Contribution

1. Creer une branche feature depuis `main`
2. Effectuer vos modifications
3. Executer le linting : `npm run lint`
4. Tester avec la collection Postman
5. Soumettre une pull request

---

Realise avec TypeScript et Express par Ilia, Mohed et Wilson.
