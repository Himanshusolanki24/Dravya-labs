#!/bin/bash

# Navigate to the directory where this script is located
cd "$(dirname "$0")"

echo "Starting all servers..."

run command = ./start.command

# Helper function to start a service
start_python_service() {
  local dir=$1
  local logfile=$2
  local cmd=$3
  local req_file=${4:-requirements.txt}

  echo "Starting $dir..."
  cd "$dir" || exit
  python3 -m pip install -r "$req_file" > /dev/null 2>&1
  eval "$cmd &> ../$logfile &"
  cd ..
}

echo "Starting PyTorch Microservices..."
start_python_service "brahma" "brahma.log" "python3 -m app.main"
start_python_service "dietplain" "dietplain.log" "python3 -m app.main"
start_python_service "herbs" "herbs.log" "python3 -m app.main"
start_python_service "Autoimmune" "autoimmune.log" "python3 -m app.main"

echo "Waiting 3 seconds for microservices to initialize..."
sleep 3

echo "Starting Backend AI Orchestrator..."
start_python_service "backend" "backend.log" "python3 -m uvicorn main:app --reload --port 8000" "requirement.txt"

echo "Starting Next.js Frontend..."
cd frontend || exit
npm install > /dev/null 2>&1
npm run dev &> ../frontend.log &
cd ..

echo ""
echo "✅ All servers have been started in the background!"
echo "📜 Check the .log files (e.g., brahma.log, backend.log, frontend.log) for output."
echo ""
# echo "To stop all servers, run: killall python3 && killall node"
# echo "You can now close this terminal window, the servers will keep running in the background."
