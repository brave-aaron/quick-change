# QuickChange - Convertisseur de Devises 

QuickChange est une application web d'échange monétaire dynamique développée dans le cadre des projets de validation de **DecodeLabs**. L'application applique une architecture Full-Stack moderne permettant de connecter une interface utilisateur réactive à un serveur Node.js et une base de données relationnelle MySQL.

##  Fonctionnalités

- **Conversion en temps réel :** Calcul instantané des conversions entre EUR, USD et XOF (CFA).
- **Taux Dynamiques :** Les cartes de taux du jour consomment directement les données centralisées du serveur pour garantir une cohérence parfaite de l'application (Source unique de vérité).
- **Historique Persistant (CRUD - Read & Delete) :** - Sauvegarde automatique de chaque transaction dans la base de données MySQL via une route `POST`.
  - Affichage dynamique des 10 dernières conversions dans une **fenêtre modale (Popup)** fluide et épurée (Focus UX).
  - Option de nettoyage complet de l'historique via une requête `DELETE` sécurisée (`TRUNCATE TABLE`).
- **Sécurité & Robustesse :** Protection native contre les failles XSS lors de l'injection des données utilisateur dans le DOM et gestion des statuts HTTP standards.

##  Technologies Utilisées

- **Frontend :** HTML5, CSS3 (Polices Google Fonts, Icônes FontAwesome), JavaScript Moderne (Fetch API, Async/Await, Manipulation du DOM).
- **Backend :** Node.js, Express.js (Gestion des routes REST et middleware CORS).
- **Base de données :** MySQL (Persistance de l'historique des conversions).

##  Installation et Lancement Local

### 1. Base de données
- Importer ou créer une base de données nommée `decodelabs_db` dans phpMyAdmin.
- Créer la table `conversions` avec les champs nécessaires (`id`, `amount`, `from_currency`, `to_currency`, `result`, `created_at`).

### 2. Lancement du Serveur Backend
Dans le dossier du projet, installer les dépendances et démarrer le serveur Node :
```bash
npm install
node server.js
