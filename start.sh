#!/bin/bash

GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Lancement de l'application DocSummarizer-AI...${NC}"

# 1. Activer l'environnement virtuel Python
echo -e "${GREEN}⚙️  Activation de l'environnement Python...${NC}"
source backend/venv/Scripts/activate || source backend/venv/bin/activate

# 2. Lancer le backend FastAPI
echo -e "${GREEN}🔧 Backend (FastAPI) lancé sur http://localhost:8000...${NC}"
cd backend
uvicorn api:app --reload &
BACK_PID=$!
cd ..

# 3. Lancer le frontend React
echo -e "${GREEN}🎨 Frontend (React) lancé sur http://localhost:3000...${NC}"
cd frontend
npm start &
FRONT_PID=$!
cd ..

# 4. Arrêt propre si Ctrl+C
trap "echo -e '\n${GREEN}🛑 Arrêt en cours...'; kill $BACK_PID $FRONT_PID" SIGINT

# 5. Attente des deux processus
wait $BACK_PID $FRONT_PID
