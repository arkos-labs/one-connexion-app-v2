# 🐳 Guide Docker - App Chauffeur

## 📋 Prérequis

- Docker Desktop installé et lancé
- Docker Compose installé (inclus avec Docker Desktop)

## 🚀 Démarrage Rapide

### Mode Développement (avec Hot Reload)

```bash
# Construire et démarrer le conteneur
docker-compose up --build

# Ou en arrière-plan
docker-compose up -d --build

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

L'application sera accessible sur **http://localhost:5173**

✅ **Hot Reload activé** : Toute modification dans `src/` sera visible instantanément !

### Mode Production

```bash
# Construire et démarrer
docker-compose -f docker-compose.prod.yml up --build -d

# Arrêter
docker-compose -f docker-compose.prod.yml down
```

L'application sera accessible sur **http://localhost:80**

## 🛠️ Commandes Utiles

### Développement

```bash
# Reconstruire l'image
docker-compose build

# Voir les conteneurs actifs
docker ps

# Accéder au shell du conteneur
docker-compose exec app-chauffeur-dev sh

# Installer une nouvelle dépendance
docker-compose exec app-chauffeur-dev npm install <package>

# Nettoyer tout
docker-compose down -v --rmi all
```

### Production

```bash
# Build de production
docker-compose -f docker-compose.prod.yml build

# Redémarrer
docker-compose -f docker-compose.prod.yml restart

# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 📁 Structure des Fichiers Docker

```
app chauffeur/
├── Dockerfile.dev          # Image de développement
├── Dockerfile              # Image de production (multi-stage)
├── docker-compose.yml      # Orchestration développement
├── docker-compose.prod.yml # Orchestration production
├── nginx.conf              # Config Nginx pour production
├── .dockerignore           # Fichiers à exclure
└── README.Docker.md        # Ce fichier
```

## 🔧 Configuration

### Variables d'Environnement

Assure-toi que ton fichier `.env` contient :

```env
VITE_SUPABASE_URL=https://sjjmwhgimvepszqxutdv.supabase.co
VITE_SUPABASE_ANON_KEY=ton_anon_key
```

### Ports

- **Développement** : 5173
- **Production** : 80

## 🐛 Dépannage

### Le hot reload ne fonctionne pas

1. Vérifie que les volumes sont bien montés :
   ```bash
   docker-compose config
   ```

2. Redémarre le conteneur :
   ```bash
   docker-compose restart
   ```

### Erreur de permissions

Sur Linux/Mac, si tu as des erreurs de permissions :
```bash
sudo chown -R $USER:$USER .
```

### Nettoyer complètement Docker

```bash
# Arrêter tous les conteneurs
docker stop $(docker ps -aq)

# Supprimer tous les conteneurs
docker rm $(docker ps -aq)

# Supprimer toutes les images
docker rmi $(docker images -q)

# Nettoyer les volumes
docker volume prune -f
```

## 📦 Déploiement

Pour déployer en production sur un serveur :

```bash
# Sur ton serveur
git clone <ton-repo>
cd app-chauffeur

# Créer le fichier .env avec les bonnes variables
nano .env

# Lancer en production
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🎯 Bonnes Pratiques

1. **Développement** : Utilise toujours `docker-compose.yml`
2. **Production** : Utilise `docker-compose.prod.yml`
3. **Ne commit jamais** le fichier `.env` avec des vraies clés
4. **Rebuild** après avoir modifié `package.json`
5. **Logs** : Consulte régulièrement avec `docker-compose logs -f`

## 🔗 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Vite + Docker](https://vitejs.dev/guide/static-deploy.html)
