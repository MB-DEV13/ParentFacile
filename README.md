# 🌿 ParentFacile

**ParentFacile** est une application web destinée à faciliter les démarches parentales, de la grossesse aux 3 ans de l’enfant.  
Elle centralise **les informations officielles**, **les documents PDF utiles** et **un espace administrateur sécurisé** pour la gestion des ressources et des messages.

---

## 🧭 Sommaire

1. 🚀 Aperçu du projet  
2. 🧱 Architecture  
3. 🛠️ Stack technique  
4. ⚙️ Installation et lancement  
5. 📁 Structure du projet  
6. 🔐 Configuration `.env`  
7. 🧑‍💼 Authentification Admin  
8. 📨 Formulaire de contact  
9. 📚 API REST  
10. 🧪 Tests & vérifications  
11. 🚢 Déploiement  
12. 💡 Améliorations futures  
13. 📜 Licence  

---

## 🚀 Aperçu du projet

### 🎯 Objectif
Offrir aux parents un point d’accès unique pour :  
- comprendre les démarches administratives selon les étapes de vie (grossesse, naissance, etc.) ;  
- télécharger les documents PDF nécessaires ;  
- contacter l’équipe ParentFacile via un formulaire relié à une base MySQL et à un service SMTP sécurisé.

### 👩‍💻 Fonctionnalités principales
Frontend :
- Pages : Accueil, Documents, Informations, Connexion Admin, Tableau de bord.  
- Téléchargement individuel ou global (ZIP) des PDF.  
- Interface claire et responsive.

Backend :
- API REST avec Express.js + MySQL.  
- Authentification admin sécurisée via JWT + cookie HttpOnly.  
- Envoi d’e-mails via **Nodemailer (SMTP Gmail)**.  
- Gestion complète : création/édition de documents PDF et lecture/réponse aux messages reçus depuis la page contact.

---

## 🧱 Architecture

```
parentfacile/
├── frontend-react/        # Application React (pages, hooks, services)
│   ├── src/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   └── public/
│
├── backend-node/          # API Express + MySQL
│   ├── server.js
│   ├── src/
│   │   ├── routes/
│   │   │   ├── admin.auth.js
│   │   │   ├── admin.docs.js
│   │   │   ├── admin.messages.js
│   │   │   └── docs.js
│   ├── public/pdfs/       # Fichiers PDF gérés par l’admin
│   └── .env               # Variables d’environnement
│
└── README.md
```

---

## 🛠️ Stack technique

### 🧩 Frontend
- **React 18+**
- **Vite**
- **React Router DOM**
- **Tailwind CSS v4**
- **Axios**
- **React Icons**

### ⚙️ Backend
- **Node.js + Express**
- **MySQL2**
- **Nodemailer**
- **bcrypt**
- **jsonwebtoken**
- **cookie-parser**
- **express-rate-limit**
- **helmet**, **cors**, **morgan**

---

## ⚙️ Installation et lancement

### 1️⃣ Cloner le projet
```bash
git clone https://github.com/ton-utilisateur/parentfacile.git
cd parentfacile
```

### 2️⃣ Installer les dépendances
#### Backend
```bash
cd backend-node
npm install
```

#### Frontend
```bash
cd ../frontend-react
npm install
```

### 3️⃣ Configurer le fichier `.env`
Exemple complet plus bas 👇

### 4️⃣ Lancer le backend
```bash
cd backend-node
node server.js
```
➡️ http://localhost:4000

### 5️⃣ Lancer le frontend
```bash
cd ../frontend-react
npm run dev
```
➡️ http://localhost:5174

---

## 🔐 Configuration `.env`

```bash
# --- API ---
PORT=4000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5174

# --- MySQL ---
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DB=parentfacile

# --- SMTP ---
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=YOUR MAIL
SMTP_PASS=YOUR MDP
SMTP_FROM="ParentFacile - YOUR MAIL"
CONTACT_TO=YOUR MAIL

# --- Auth Admin ---
ADMIN_JWT_SECRET=une_chaine_random_longue_inchangeable_en_prod
ADMIN_COOKIE_NAME=admintoken
ADMIN_COOKIE_SECURE=false

# --- Admin initial ---
ADMIN_SEED_EMAIL=admin@parentfacile.fr
ADMIN_SEED_PASSWORD=Admin1234! (Changer dans la bdd)
```

---

## 🧑‍💼 Authentification Admin

- **Connexion** : `POST /api/admin/auth/login`  
- **Déconnexion** : `POST /api/admin/auth/logout`  
- **Vérification** : `GET /api/admin/auth/me`

L’administrateur dispose d’un espace privé pour :  
✅ Créer / modifier / supprimer des documents PDF.  
✅ Lire et répondre aux messages reçus via la page de contact.  

---

## 📨 Formulaire de contact

`POST /api/contact`  
Enregistre le message dans la base et envoie un e-mail à l’adresse configurée (`CONTACT_TO`).  
Protection anti-bot via champ honeypot invisible et validation côté serveur.

---

## 📚 API REST

| Méthode | Route | Description |
|----------|--------|-------------|
| `GET` | `/api/docs` | Liste paginée des documents PDF |
| `GET` | `/api/docs/:id/download` | Téléchargement d’un document |
| `POST` | `/api/contact` | Envoi d’un message |
| `POST` | `/api/admin/auth/login` | Connexion admin |
| `POST` | `/api/admin/auth/logout` | Déconnexion |
| `GET` | `/api/admin/auth/me` | Vérification du token |
| `GET` | `/api/admin/messages` | Derniers messages |
| `GET` | `/api/admin/messages/all` | Liste complète des messages |
| `POST` | `/api/admin/docs` | Création d’un document PDF |
| `DELETE` | `/api/admin/docs/:id` | Suppression d’un document |

---

## 🧪 Tests & vérifications

- ✅ `MySQL OK` → connexion et tables créées automatiquement  
- ✅ `SMTP OK` → prêt à envoyer des e-mails  
- ✅ `AdminSeed` → compte admin créé ou détecté

---

## 🚢 Déploiement

- Configurer les variables `.env` sur le serveur.  
- Démarrer l’API : `node server.js` ou via **PM2 / Docker**.  
- Déployer le frontend compilé (`npm run build`) sur **Netlify**, **Vercel**, **OVH**, etc.

---

## 📜 Licence

Projet **ParentFacile** – © 2025 MBDev  

---

