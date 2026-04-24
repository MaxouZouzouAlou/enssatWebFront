# LocalZH — Frontend (React)

Interface web du projet LocalZH, construite avec React (Create React App) et React Query.

---

## Prérequis

- Node.js >= 16 et npm
- Le backend LocalZH lancé localement (voir `enssatWebBack`)

---

## Installation de A à Z

### 1. Cloner le dépôt

```bash
# HTTPS
git clone https://github.com/MaxouZouzouAlou/enssatWebFront.git

# SSH
git clone git@github.com:MaxouZouzouAlou/enssatWebFront.git

cd enssatWebFront
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Créer le fichier `.env`

Créer un fichier `.env` à la racine du projet :

```bash
PORT=3000
REACT_APP_API_URL=http://localhost:49161
REACT_APP_ENABLE_GOOGLE_AUTH=false
```

> Mettre `REACT_APP_ENABLE_GOOGLE_AUTH=true` uniquement si le backend a aussi `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` configurés.

### 4. Lancer l'application

```bash
npm start
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

---

## Comptes de test

Pour explorer toutes les facettes de la plateforme, vous pouvez utiliser les comptes suivants (Mot de passe : `Test1234@`) :

| Type de compte | Email | Particularité |
|---|---|---|
| **Super Admin** | `testsuperadmin1@gmail.com` | Accès à la gestion des comptes, entreprises, produits et tickets incidents. |
| **Producteur** | `testprofessionnel1@gmail.com` | Gère **deux entreprises** (Les fruits de mamie & Conserverie du Trégor). |
| **Particulier** | `client.bulk+008@localzh.test` | Possède déjà un **bon d'achat actif** et un historique de commandes. |

---

## Commandes disponibles

| Commande | Description |
|---|---|
| `npm start` | Démarre le serveur de développement (rechargement automatique) |
| `npm test` | Lance les tests en mode interactif |
| `npm run build` | Compile l'application pour la production dans `build/` |

---

## Architecture

```
src/
├── app/              # Entrée React, routing, providers globaux (QueryClient, Toast)
├── components/       # Composants UI réutilisables
├── features/         # Logique métier par domaine (auth, cart, checkout, dashboard…)
├── hooks/            # Hooks React génériques
├── pages/            # Composants de page (une page = une route)
├── services/         # Clients HTTP vers le backend
└── utils/            # Utilitaires partagés (queryKeys, formatters…)
```

Les fichiers source et leurs tests sont co-localisés dans des dossiers nommés (ex : `LoginForm/LoginForm.jsx` + `LoginForm/LoginForm.test.jsx`).

---

## Notes d'authentification

- L'inscription e-mail/mot de passe redirige vers une vérification e-mail avant connexion.
- L'inscription professionnelle collecte l'adresse de l'entreprise (`adresse_ligne`, `code_postal`, `ville`).
- La connexion Google nécessite `REACT_APP_ENABLE_GOOGLE_AUTH=true` et un backend configuré en conséquence.

---

## Workflow Git

```bash
git pull origin main          # toujours avant de commencer
git checkout -b feat/ma-feature
# ... travail ...
git add <fichiers>
git commit -m "feat: description"
git push origin feat/ma-feature
```

Conventions de nommage des branches et commits : `feat/`, `fix/`, `docs/`, `delete/`.
