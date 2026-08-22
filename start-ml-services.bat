@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>&1
if %ERRORLEVEL%==0 (
    set "PY=py -3"
) else (
    where python >nul 2>&1
    if %ERRORLEVEL%==0 (
        set "PY=python"
    ) else (
        echo Python was not found. Install Python 3 and retry.
        pause
        exit /b 1
    )
)

echo Starting ML services in separate windows...
echo   herbs              http://localhost:8002
echo   Autoimmune         http://localhost:8003
echo   dietplain          http://localhost:8004
echo   brahma             http://localhost:8005
echo   symptom_treatment  http://localhost:8006
echo   skin               http://localhost:8007
echo   diabetes           http://localhost:8008
echo.

start "ML herbs :8002" cmd /k "cd /d "%~dp0herbs" && set PORT=8002 && %PY% -m app.main"
start "ML Autoimmune :8003" cmd /k "cd /d "%~dp0Autoimmune" && set PORT=8003 && %PY% -m app.main"
start "ML dietplain :8004" cmd /k "cd /d "%~dp0dietplain" && set PORT=8004 && %PY% -m app.main"
start "ML brahma :8005" cmd /k "cd /d "%~dp0brahma" && set PORT=8005 && %PY% -m app.main"
start "ML symptom_treatment :8006" cmd /k "cd /d "%~dp0symptom_treatment" && set PORT=8006 && %PY% -m app.main"
start "ML skin :8007" cmd /k "cd /d "%~dp0skin" && set PORT=8007 && %PY% -m app.main"
start "ML diabetes :8008" cmd /k "cd /d "%~dp0diabetes" && %PY% -m uvicorn app.main:app --host 0.0.0.0 --port 8008"

echo All ML service windows launched.
echo Close those windows to stop the services.
pause
