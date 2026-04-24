@echo off
cd /d "%~dp0"

echo Checking for virtual environment...
if not exist .venv (
    echo Creating virtual environment...
    python -m venv .venv
    call .venv\Scripts\activate
    echo Installing dependencies...
    pip install -r requirement.txt
) else (
    call .venv\Scripts\activate
)

echo Starting Herb MCP on port 8001...
start "Herb MCP Server" python mcp/herb_mcp/main.py

echo Waiting for MCP to initialize...
timeout /t 5 /nobreak >nul

echo Starting Main API on port 8000...
python main.py
