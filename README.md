# Portail Web Dynamique du LISI (Laboratoire LISI - FSSM)

Le projet utilise une architecture **frontend-backend** moderne :
- **Backend** : Laravel 11 (API REST avec Sanctum pour l'authentification)
- **Frontend** : React.js + TypeScript + Vite (avec Tailwind CSS et shadcn/ui)
- **Base de données** : MySQL
- **Internationalisation** : Support multilingue (Français, Anglais, Arabe)

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **PHP 8.1+** (recommandé : PHP 8.4)
- **Composer** (gestionnaire de dépendances PHP)
- **Node.js 18+** et **npm**
- **MySQL 8.0+** ou **MariaDB**
- **Git**
- **XAMPP** (optionnel, pour un environnement de développement complet)

### Vérification des versions
```bash
php --version          # PHP 8.1 ou supérieur
composer --version     # Composer installé
node --version         # Node.js 18+
npm --version          # npm installé
mysql --version        # MySQL/MariaDB
```

## 🚀 Installation et Configuration

### 1. Clonage du projet
```bash
git clone https://github.com/khayoubIsmail/LISI.git
cd LISI
```

### 2. Configuration de la base de données

#### Création de la base de données MySQL
```sql
-- Dans phpMyAdmin ou MySQL Workbench
CREATE DATABASE lisi_lab CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Créer un utilisateur pour la base de données
CREATE USER 'lisi_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON lisi_lab.* TO 'lisi_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configuration du Backend (Laravel)

#### Installation des dépendances PHP
```bash
cd backend
composer install
```

#### Configuration de l'environnement
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Générer la clé d'application
php artisan key:generate
```

#### Configuration du fichier .env
Modifiez le fichier `.env` avec vos paramètres :

```env
APP_NAME="LISI Laboratory Portal"
APP_ENV=local
APP_KEY=base64:your_generated_key_here
APP_DEBUG=true
APP_TIMEZONE=UTC
APP_URL=http://localhost:8000

# Base de données
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=lisi_lab
DB_USERNAME=lisi_user
DB_PASSWORD=votre_mot_de_passe

# Cache et sessions
CACHE_STORE=database
SESSION_DRIVER=database

# Sanctum pour l'authentification API
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173

# Mail (optionnel)
MAIL_MAILER=log
```

#### Extensions PHP requises
Assurez-vous que ces extensions sont activées dans votre `php.ini` :
- `extension=pdo_mysql`
- `extension=mbstring`
- `extension=openssl`
- `extension=fileinfo`
- `extension=gd` (pour les images)

#### Migration et seeding de la base de données
```bash
# Créer les tables
php artisan migrate

# Peupler la base avec des données d'exemple
php artisan db:seed

# Ou forcer le seeding (écrase les données existantes)
php artisan db:seed --force
```

#### Création des liens de stockage
```bash
php artisan storage:link
```

#### Création d'un administrateur
```bash
# Créer un compte administrateur
php artisan user:make-admin admin@lisi.com --password=admin123

# Vérifier que l'utilisateur est approuvé
php artisan tinker --execute="echo App\Models\User::where('email', 'admin@lisi.com')->first()->is_approved;"
```

#### Démarrage du serveur backend
```bash
# Démarrer le serveur Laravel
php artisan serve --host=localhost --port=8000

# Ou avec un hôte spécifique
php artisan serve --host=127.0.0.1 --port=8000
```

### 4. Configuration du Frontend (React + TypeScript)

#### Installation des dépendances Node.js
```bash
cd ../frontend
npm install
```

#### Vérification de la configuration
Le frontend est configuré pour communiquer avec le backend sur `http://localhost:8000`.

#### Démarrage du serveur de développement
```bash
# Démarrer Vite avec hot reload
npx vite --host 127.0.0.1

# Ou utiliser npm si configuré
npm run dev
```

## 🌐 Accès à l'application

Une fois les serveurs démarrés :
- **Frontend** : http://127.0.0.1:5173
- **Backend API** : http://localhost:8000
- **phpMyAdmin** : http://localhost/phpmyadmin (si XAMPP)

## 🔧 Commandes utiles

### Backend (Laravel)
```bash
# Nettoyer le cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Générer des clés Sanctum
php artisan config:cache

# Vérifier les routes API
php artisan route:list --path=api

# Tests
php artisan test
```

### Frontend (React)
```bash
# Build de production
npm run build

# Preview du build
npm run preview

# Linting
npm run lint

# Tests
npm run test
npm run test:watch
npm run test:coverage
```

## 🗄️ Structure du projet

```
LISI/
├── backend/                 # API Laravel
│   ├── app/
│   ├── config/
│   ├── database/
│   ├── routes/
│   └── ...
├── frontend/                # Application React
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── i18n/           # Traductions
│   │   └── ...
│   └── ...
└── README.md
```

## 🌍 Fonctionnalités

- ✅ **Multilingue** : Français, Anglais, Arabe
- ✅ **Interface moderne** : Design glassmorphism avec Tailwind CSS
- ✅ **Authentification** : Via Laravel Sanctum
- ✅ **Gestion de contenu** : Axes de recherche, Membres, Publications, etc.
- ✅ **Dashboard admin** : Gestion complète du contenu
- ✅ **Responsive** : Adapté mobile et desktop

## 🐛 Dépannage

### Erreur de connexion à la base de données
```bash
# Vérifier les credentials dans .env
php artisan config:clear
php artisan migrate:status
```

### Problèmes d'authentification
```bash
# Vérifier la configuration Sanctum
php artisan config:cache
# Vérifier les domaines stateful dans .env
```

### Erreur de compilation frontend
```bash
# Nettoyer node_modules
rm -rf node_modules package-lock.json
npm install
```

### Port déjà utilisé
```bash
# Tuer les processus utilisant le port
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Problèmes de traduction
```bash
# Vérifier les fichiers JSON de traduction
cd frontend/src/i18n/locales/
# Les fichiers doivent être valides JSON
```

## 📞 Support

Pour toute question ou problème :
1. Vérifiez les logs Laravel : `storage/logs/laravel.log`
2. Consultez la console du navigateur pour les erreurs frontend
3. Vérifiez que tous les services sont démarrés

## 📝 Notes de développement

- Le projet utilise **TypeScript** pour le frontend
- **ESLint** et **Prettier** sont configurés
- Les tests utilisent **Jest** et **React Testing Library**
- L'internationalisation utilise **react-i18next**

---

**Développé avec ❤️ pour le Laboratoire LISI - FSSM**
