#!/bin/bash

# Couleur pour le terminal
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Lancement de l'application DocSummarizer-AI...${NC}"

# 1. Lancer le backend FastAPI
echo -e "${GREEN}🔧 Démarrage du backend FastAPI...${NC}"
cd backend
uvicorn api:app --reload &
BACKEND_PID=$!
cd ..

# 2. Lancer le frontend (React ou simple serveur)
echo -e "${GREEN}🎨 Démarrage du frontend...${NC}"
cd frontend

if [ -f "package.json" ]; then
  npm install
  npm start &
  FRONT_PID=$!
else
  # Sinon, simple serveur avec Python
  python -m http.server 3000 &
  FRONT_PID=$!
fi

cd ..

# Attente propre de l'arrêt
trap "echo -e '${GREEN}🛑 Arrêt en cours...'; kill $BACKEND_PID $FRONT_PID" SIGINT

wait $BACKEND_PID $FRONT_PID
