#!/usr/bin/env bash

# ==============================================================================
#  LOUSTIC - SCRIPT DE DÉMARRAGE UNIFIÉ (Backend Spring Boot + Frontend React)
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# Couleurs pour le terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BOLD}${BLUE}"
echo "  _     ___  _   _ ____ _____ ___ ____ "
echo " | |   / _ \| | | / ___|_   _|_ _/ ___|"
echo " | |  | | | | | | \___ \ | |  | | |    "
echo " | |__| |_| | |_| |___) || |  | | |___ "
echo " |_____\___/ \___/|____/ |_| |___\____|"
echo -e "${NC}"
echo -e "${YELLOW}🎈 Démarrage de Loustic (React 19 + Spring Boot 3)...${NC}\n"

# Support de l'orchestration Docker tout-en-un
if [ "$1" == "--docker" ] || [ "$1" == "docker" ]; then
    echo -e "${BLUE}🐳 Mode Docker activé : orchestration globale de Loustic...${NC}"
    command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker n'est pas installé ou n'est pas dans le PATH.${NC}"; exit 1; }
    
    if ! docker info >/dev/null 2>&1; then
        echo -e "${RED}❌ Le daemon Docker ne semble pas démarré. Veuillez lancer Docker Desktop.${NC}"
        exit 1
    fi

    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")

    echo -e "${YELLOW}🔨 Construction de l'image Docker tout-en-un (React 19 + Spring Boot 3)...${NC}"
    docker build -t loustic .

    echo -e "\n${BOLD}${GREEN}================================================================${NC}"
    echo -e "${BOLD}${GREEN}  🎉 CONTENEUR LOUSTIC PRÊT À DÉMARRER !${NC}"
    echo -e "${BOLD}${GREEN}================================================================${NC}"
    echo -e "  💻 Sur cet ordinateur :  ${BOLD}${BLUE}http://localhost:8080${NC}"
    echo -e "  📱 Sur vos téléphones :  ${BOLD}${GREEN}http://${LOCAL_IP}:8080${NC} (même Wi-Fi)"
    if [ -n "$DATABASE_URL" ]; then
        echo -e "  🐘 Base de données :     ${GREEN}Neon PostgreSQL connectée${NC}"
    else
        echo -e "  🐘 Base de données :     ${YELLOW}H2 local en mémoire (fallback)${NC}"
    fi
    echo -e "${BOLD}${GREEN}================================================================${NC}"
    echo -e "${YELLOW}👉 Appuyez sur [Ctrl + C] pour arrêter le conteneur.${NC}\n"

    docker run --rm -p 8080:8080 -e DATABASE_URL="$DATABASE_URL" -e PORT=8080 --name loustic-app loustic
    exit 0
fi

# 1. Vérification des prérequis
command -v java >/dev/null 2>&1 || { echo -e "${RED}❌ Java 17+ n'est pas installé.${NC}"; exit 1; }
command -v mvn >/dev/null 2>&1 || { echo -e "${RED}❌ Maven n'est pas installé.${NC}"; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js n'est pas installé.${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}❌ npm n'est pas installé.${NC}"; exit 1; }

# Vérifier si loustic-frontend/node_modules existe
if [ ! -d "loustic-frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installation des dépendances frontend...${NC}"
    npm --prefix loustic-frontend install
fi

# Récupérer l'IP locale pour le Wi-Fi
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")

# Nettoyage automatique des processus en cas d'arrêt (Ctrl+C)
cleanup() {
    echo -e "\n\n${YELLOW}🛑 Arrêt des services Loustic...${NC}"
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    # Tuer d'éventuels processus orphelins sur les ports 8080 et 5173
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}✅ Tous les services sont arrêtés. À bientôt !${NC}"
    exit 0
}

trap cleanup INT TERM EXIT

# Libérer les ports si déjà occupés
echo -e "${BLUE}🔍 Vérification des ports 8080 et 5173...${NC}"
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# 2. Démarrage du Backend Java Spring Boot
echo -e "${GREEN}☕ Démarrage du Backend Spring Boot (port 8080)...${NC}"
mvn -f loustic-backend/pom.xml spring-boot:run > loustic-backend.log 2>&1 &
BACKEND_PID=$!

# Attendre que le backend soit prêt (health check HTTP)
echo -n "⏳ En attente de l'initialisation du backend..."
READY=0
for i in {1..40}; do
    if curl -s http://localhost:8080/api/games >/dev/null 2>&1; then
        READY=1
        break
    fi
    sleep 1
    echo -n "."
done
echo ""

if [ $READY -eq 1 ]; then
    echo -e "${GREEN}✅ Backend Spring Boot prêt et connecté aux decks CSV !${NC}"
else
    echo -e "${RED}⚠️ Le backend a mis du temps à démarrer. Vérifiez 'loustic-backend.log'.${NC}"
fi

# 3. Démarrage du Frontend React Vite
echo -e "${GREEN}⚛️  Démarrage du Frontend React (port 5173)...${NC}"
npm --prefix loustic-frontend run dev -- --host > loustic-frontend.log 2>&1 &
FRONTEND_PID=$!

sleep 2

echo -e "\n${BOLD}${GREEN}================================================================${NC}"
echo -e "${BOLD}${GREEN}  🎉 LOUSTIC EST EN LIGNE ET PRÊT À JOUER !${NC}"
echo -e "${BOLD}${GREEN}================================================================${NC}"
echo -e "  💻 Sur cet ordinateur :  ${BOLD}${BLUE}http://localhost:5173${NC}"
echo -e "  📱 Sur vos téléphones :  ${BOLD}${GREEN}http://${LOCAL_IP}:5173${NC} (même Wi-Fi)"
echo -e "  ☕ Backend API :         ${BLUE}http://localhost:8080/api/games${NC}"
echo -e "${BOLD}${GREEN}================================================================${NC}"
echo -e "${YELLOW}👉 Appuyez sur [Ctrl + C] pour tout arrêter.${NC}\n"

# Ouvrir automatiquement le navigateur sur Mac
if command -v open >/dev/null 2>&1; then
    open "http://localhost:5173" 2>/dev/null || true
fi

# Garder le script actif et afficher les logs utiles
wait
