# ParentFacile

**ParentFacile** est une application web complète permettant de centraliser toutes les démarches parentales (de la grossesse à 3 ans), d’accéder à des **documents PDF officiels**, et de piloter un **espace administrateur sécurisé** pour gérer les contenus et les messages.

---

## 🧭 Sommaire

1. 🚀 Aperçu du projet  
2. 🧱 Architecture réelle (version locale du repo)  
3. 🛠️ Stack technique  
4. ⚙️ Installation & configuration locale  
5. 🗄️ Base de données MySQL  
6. 📚 Documentation API (Swagger – local)  
7. 🔐 Authentification Admin (JWT + cookies)  
8. 📨 Formulaire de contact  
9. 📂 API REST (exemples)  
10. 🚢 Déploiement (hébergement)  
11. 💡 Améliorations futures  
12. 📜 Licence  

---

## 🚀 Aperçu du projet

ParentFacile fournit :

### 👨‍👩‍👧 **Frontend (React + Vite)**

- Accueil  
- Informations / Parcours parental  
- Liste des PDF (preview, téléchargement, ZIP)  
- Contact  
- Login Admin  
- Dashboard Admin (documents, messages)

### 🖥️ **Backend (Node + Express + MySQL)**

- Gestion des documents PDF  
- API REST stable et sécurisée  
- Formulaire de contact + envoi d’emails (SMTP)  
- Authentification Admin via **JWT en cookie HttpOnly**  
- Documentation **Swagger** 

---

## 🧱 Architecture (structure réelle du repo LOCAL)

```bash
.
├── backend-node/                 # API Express + MySQL
│   ├── SQL/                      # Scripts SQL (structure + données)
│   │   ├── parentfacile_schema.sql
│   │   └── parentfacile_seed.sql
│   ├── public/
│   │   └── pdfs/                 # Fichiers PDF servis en statique
│   ├── src/
│   │   └── routes/               # admin.auth.js, admin.docs.js, admin.messages.js, docs.js
│   ├── .env                      # Variables d'environnement du backend (non versionné)
│   └── server.js                 # Entrée serveur (Express)
│
├── public/                       # Frontend public (Vite)
├── src/                          # Frontend source (pages, components, hooks, services, utils)
│   ├── pages/
│   ├── routes/
│   ├── services/
│   └── ...
├── .env                          # Variables pour le frontend si nécessaire
├── index.html                    # Entrée Vite
├── package.json                  # Dépendances du frontend
└── README.md
```

---

## 🛠️ Stack technique

### **Frontend**

- React 18  
- Vite  
- Tailwind CSS v4  
- React Router  
- Axios  

### **Backend**

- Node.js  
- Express  
- MySQL2 (pool de connexions)  
- Nodemailer  
- bcrypt  
- jsonwebtoken  
- express-validator  
- express-rate-limit  
- cookie-parser  
- cors  

### **Documentation**

- swagger-jsdoc  
- swagger-ui-express  

---

## ⚙️ Installation & Configuration (local)

### 1) Cloner le projet

```bash
git clone https://github.com/ton-utilisateur/parentfacile.git
cd parentfacile
```

### 2) Installer les dépendances

**Backend :**

```bash
cd backend-node
npm install
```

**Frontend :**

```bash
cd ..
npm install
```

### 3) Configurer le backend

Créer le fichier `backend-node/.env` :

```dotenv
PORT=4000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173

MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DB=parentfacile

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=votre@gmail.com
SMTP_PASS=MDP_APPLICATION_GMAIL
CONTACT_TO=votre@gmail.com

ADMIN_JWT_SECRET=chaine_random_longue
ADMIN_COOKIE_NAME=admintoken
ADMIN_COOKIE_SECURE=false

ADMIN_SEED_EMAIL=admin@parentfacile.fr
ADMIN_SEED_PASSWORD=Admin1234!
```

> 🔐 Pour Gmail : activer la **double authentification (2FA)** et créer un **mot de passe d’application** à utiliser dans `SMTP_PASS`.

---

## 🗄️ Base de données MySQL

Les scripts SQL se trouvent dans `backend-node/SQL/`.

1. Créer la base `parentfacile` dans MySQL.  
2. Importer la structure :

```sql
SOURCE backend-node/SQL/parentfacile_schema.sql;
```

3. Importer le contenu de départ :

```sql
SOURCE backend-node/SQL/parentfacile_seed.sql;
```

> Le compte admin **seed** est créé automatiquement si absent (ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD).
>
Compte Admin Demo :
email : admin@parentfacile.fr
Mit de passe : Admin1234!

---

## 📚 Documentation API (Swagger – LOCAL)

La documentation Swagger est disponible **en local** lorsque le backend tourne.

- Démarrer le backend (voir section suivante).  
- Ouvrir :

```text
http://localhost:4000/api-docs
```

Swagger permet de :  
- lister les routes,  
- tester les appels en live,  
- visualiser les schémas de données,  
- faciliter les tests et la maintenance.

---

## ▶️ Démarrer en local

### Backend

```bash
cd backend-node
node server.js
# API disponible sur : http://localhost:4000
```

> Au démarrage, le serveur crée les tables si besoin et vérifie la connexion SMTP.

### Frontend

Dans un autre terminal :

```bash
cd parentfacile
npm run dev
# Front disponible sur : http://localhost:5173
```

Le frontend appelle le backend sur `http://localhost:4000` (CORS configuré via `ALLOWED_ORIGINS`).

---

## 🔐 Authentification Admin

Endpoints principaux :

- **POST** `/api/admin/auth/login`  
  → connexion admin, génération d’un JWT, stockage dans un cookie HttpOnly.

- **GET** `/api/admin/auth/me`  
  → permet de savoir si l’admin est connecté.

- **POST** `/api/admin/auth/logout`  
  → supprime le cookie et déconnecte l’admin.

En espace admin, il est possible de :  
- créer / supprimer des PDF,  
- consulter les messages envoyés par le formulaire de contact.

---

## 📨 Formulaire de contact

- **POST** `/api/contact`  

Fonctionnement :  

1. Validation des champs via `express-validator`.  
2. Champ caché (honeypot) pour limiter les bots.  
3. Insertion du message dans la table `messages`.  
4. Envoi d’un email vers `CONTACT_TO` via Nodemailer / SMTP.  
5. Mise à jour des champs `email_sent` et `sent_at` en base.

---

## 📂 API REST – Exemples

| Méthode | Route                     | Description                             |
|--------|---------------------------|-----------------------------------------|
| GET    | `/api/docs`               | Liste paginée des documents             |
| GET    | `/api/docs/:id/preview`   | Prévisualisation PDF inline             |
| GET    | `/api/docs/:id/download`  | Téléchargement d’un PDF                 |
| POST   | `/api/contact`            | Envoi d’un message de contact           |
| POST   | `/api/admin/auth/login`   | Connexion admin                         |
| POST   | `/api/admin/auth/logout`  | Déconnexion admin                       |
| GET    | `/api/admin/auth/me`      | Vérification de la session admin        |
| GET    | `/api/admin/messages`     | Récupération des derniers messages      |
| POST   | `/api/admin/docs`         | Création d’un document (upload)         |
| DELETE | `/api/admin/docs/:id`     | Suppression d’un document               |

---

## 🚢 Déploiement (hébergement)

En production, le projet peut être déployé sur un hébergeur compatible Node.js + MySQL, par exemple :

- Backend : AlwaysData / Render / Railway (Node.js + MySQL)  
- Frontend : build Vite servi par le même serveur Node ou par un hébergeur statique  
- Base de données : MySQL (hébergement managé ou serveur dédié)

> Dans la version réelle du projet, le site est déployé sur **AlwaysData** (backend + frontend sur le même domaine).

---

## 💡 Améliorations futures

- Espace utilisateur (non admin)  
- Gestion de compte parent / préférences  
- Système de notifications (emails) selon les étapes clés (grossesse, naissance, rentrée, etc.)  
- PWA / version mobile avancée  
- Recherche et filtres sur les documents  

---

## 📜 Licence

© 2025 **ParentFacile** — MBDev  
Projet éducatif & personnel.
