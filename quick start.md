# Dravya Labs Quickstart Guide

This guide will help you start the Dravya Labs AI Backend and all its interconnected Neural Network microservices.

Instead of Node.js (`npm`), this backend runs entirely on **Python** and **FastAPI**.

---

## ⚡️ Quickest Start (macOS)

If you are on a Mac, you can skip the manual steps below. Simply:
1. Open Finder
2. Navigate to the `Dravya-labs2` folder
3. Double-click the **`start.command`** file

This script will automatically install dependencies and start all the PyTorch models, backend orchestrator, and Next.js frontend in the background.

Logs are saved to `brahma.log`, `dietplain.log`, `herbs.log`, `autoimmune.log`, `backend.log`, and `frontend.log` in this directory.
To stop all services later, open a terminal and run `killall python3 && killall node`.

---

## 🚀 1. Start the Microservices (Terminals 1, 2, 3, 4)

You need to start each of the trained PyTorch models on their designated ports. Open four separate terminals and run the following in each:

### Terminal 1 (Brahma Dosha Model - Port 8005)
```bash
cd brahma
python3 -m pip install -r requirements.txt
python3 -m app.main
```

### Terminal 2 (Dietplain Ahara Model - Port 8004)
```bash
cd dietplain
python3 -m pip install -r requirements.txt
python3 -m app.main
```

### Terminal 3 (Herb Knowledge Model - Port 8003)
```bash
cd herbs
python3 -m pip install -r requirements.txt
python3 -m app.main
```

### Terminal 4 (Autoimmune Risk Model - Port 8002)
```bash
cd Autoimmune
python3 -m pip install -r requirements.txt
python3 -m app.main
```

---

## 🧠 2. Start the Master Orchestrator (Terminal 5)

Once the four microservices are running, you can start the main `backend` which connects to the Next.js Frontend.

### Terminal 5 (Backend AI Orchestrator - Port 8000)
```bash
cd backend
python3 -m pip install -r requirement.txt
python3 main.py
```
cd backend 
python3 -m uvicorn main:app --reload --port 8000

*(Note: The server will start on `http://localhost:8000`. This is the URL that your React UI uses via `NEXT_PUBLIC_AI_URL`)*

---

## 💻 3. Start the Next.js Frontend (Terminal 6)

Finally, in a new terminal, launch your user interface:

```bash
cd frontend
npm install
npm run dev
```

You can now interact with the AI securely at `http://localhost:3000`!
