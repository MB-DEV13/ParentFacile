# ParentFacile

**ParentFacile** est une application web complète permettant de centraliser toutes les démarches parentales (de la grossesse à 3 ans), d’accéder à des **documents PDF officiels**, et de piloter un **espace administrateur sécurisé** pour gérer le contenu et les messages.

---

## 🧭 Sommaire

1. 🚀 Aperçu du projet
2. 🧱 Architecture réelle
3. 🛠️ Stack technique
4. ⚙️ Installation & configuration locale
5. 🗄️ Base de données MySQL
6. 📚 Documentation API (Swagger)
7. 🔐 Authentification Admin (JWT + cookies)
8. 📨 Formulaire de contact
9. 📂 API REST (exemples)
10. 🚢 Déploiement (AlwaysData / Local)
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
- Documentation **Swagger** automatiquement générée

---

### 🧱 Architecture (structure réelle)

```
.
├── backend-node/                 # API Express + MySQL
│   ├── SQL/                      # Scripts SQL (structure + données)
│   │   ├── parentfacile_schema.sql
│   │   └── parentfacile_seed.sql
│   ├── public/
│   │   └── pdfs/                 # Fichiers PDF servis en statique
│   ├── src/
│   │   └── routes/               # admin.auth.js, admin.docs.js, admin.messages.js, docs.js
│   ├── .env                      # Variables d'environnement du backend
│   └── server.js                 # Entrée serveur (Express)
│
├── public/                       # Frontend public (Vite)
├── src/                          # Frontend source (pages, components, hooks, services, utils)
│   ├── pages/
│   ├── routes/
│   ├── services/
│   └── ...
├── .env                          # (optionnel) variables pour le frontend si nécessaire
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
- MySQL2 / promise pool
- Nodemailer
- bcrypt
- jsonwebtoken
- express-validator
- express-rate-limit
- cookie-parser
- CORS

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

Backend :

```bash
npm install
```

Frontend :

```bash
cd frontend
npm install
```

### 3) Configurer le backend

Créer `/www/.env` ou `backend-node/.env` :

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
SMTP_PASS=MDP_APPLICATION
CONTACT_TO=votre@gmail.com

ADMIN_JWT_SECRET=chaine_random_longue
ADMIN_COOKIE_NAME=admintoken
ADMIN_COOKIE_SECURE=false

ADMIN_SEED_EMAIL=admin@parentfacile.fr
ADMIN_SEED_PASSWORD=Admin1234!
```

> 🔐 Pour Gmail : active la **2FA** et crée un **mot de passe d’application** → à mettre dans `SMTP_PASS`.

---

## 🗄️ Base de données MySQL

Importer la structure :

```sql
SOURCE SQL/parentfacile_schema.sql;
```

Importer le contenu initial :

```sql
SOURCE SQL/parentfacile_seed.sql;
```

---

## 📚 Documentation API (Swagger)

### En local :

http://localhost:4000/api-docs

---

## 🔐 Authentification Admin

- **POST** `/api/admin/auth/login` → connexion (JWT émis, stocké en cookie HttpOnly)
- **POST** `/api/admin/auth/logout` → déconnexion (clear cookie)
- **GET** `/api/admin/auth/me` → qui suis‑je ?

> En admin : **créer/éditer/supprimer des documents PDF**, **lire et répondre** aux messages du contact.

---

## 📨 Formulaire de contact

- **POST** `/api/contact` → enregistre le message en base + envoie un email à `CONTACT_TO`.
- Protections : **express-validator**, honeypot anti‑bot, **rate‑limit**.

---

## 📂 API REST – Exemples

| Méthode | Route                     | Description                     |
| ------- | ------------------------- | ------------------------------- |
| GET     | `/api/docs`               | Liste paginée des documents     |
| GET     | `/api/docs/:id/download`  | Téléchargement d’un PDF         |
| POST    | `/api/contact`            | Envoi d’un message              |
| POST    | `/api/admin/auth/login`   | Connexion admin                 |
| POST    | `/api/admin/auth/logout`  | Déconnexion                     |
| GET     | `/api/admin/auth/me`      | Vérification session            |
| GET     | `/api/admin/messages`     | Derniers messages               |
| GET     | `/api/admin/messages/all` | Tous les messages (cap)         |
| POST    | `/api/admin/docs`         | Création d’un document (upload) |
| DELETE  | `/api/admin/docs/:id`     | Suppression d’un document       |

---

## 🚢 Déploiement (AlwaysData)

Backend :

- Application Node.js
- Commande : `node server.js`
- Racine : `/www`

Frontend :

- Build Vite → `/public_web`

Résultats :

- Front : https://parentfacile.alwaysdata.net/
- API : https://parentfacile.alwaysdata.net/api
- Docs Swagger : https://parentfacile.alwaysdata.net/api-docs

---

## 📜 Licence

© 2025 ParentFacile — MBDev  
Projet éducatif & personnel.