#!/bin/bash
cd "$(dirname "$0")"
mkdir -p logs

PY=python3
command -v python3 >/dev/null 2>&1 || PY=python

start_ml() {
  local dir="$1"
  local port="$2"
  echo "Starting $dir on http://localhost:$port"
  (
    cd "$dir" || exit 1
    export PORT="$port"
    exec $PY -m app.main
  ) > "logs/${dir}.log" 2>&1 &
  echo $! > "logs/${dir}.pid"
}

echo "Starting ML services..."
start_ml herbs 8002
start_ml Autoimmune 8003
start_ml dietplain 8004
start_ml brahma 8005
start_ml symptom_treatment 8006
start_ml skin 8007

echo "Starting diabetes on http://localhost:8008"
(
  cd diabetes || exit 1
  exec $PY -m uvicorn app.main:app --host 0.0.0.0 --port 8008
) > logs/diabetes.log 2>&1 &
echo $! > logs/diabetes.pid

echo ""
echo "ML services launched in the background."
echo "Logs: logs/*.log"
echo "Stop: kill \$(cat logs/*.pid)"
