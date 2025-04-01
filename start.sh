#!/bin/bash

GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Lancement de l'application DocSummarizer-AI...${NC}"

# 1. Démarrage du backend FastAPI
echo -e "${GREEN}🔧 Backend (FastAPI) lancé sur http://localhost:8000...${NC}"
cd backend
uvicorn api:app --reload &
BACK_PID=$!
cd ..

# 2. Démarrage du frontend React
echo -e "${GREEN}🎨 Frontend (React) lancé sur http://localhost:3000...${NC}"
cd frontend
npm start &
FRONT_PID=$!
cd ..

# 3. Gestion propre de l'arrêt
trap "echo -e '\n${GREEN}🛑 Arrêt en cours...'; kill $BACK_PID $FRONT_PID" SIGINT

# 4. Attendre les deux processus
wait $BACK_PID $FRONT_PID
