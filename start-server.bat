@echo off
set VENV_PATH=Z:\antigravity\venv

echo --- Activating Environment to Start Local Web Server ---
call "%VENV_PATH%\Scripts\activate.bat"
if %errorlevel% neq 0 (
    echo.
    echo FAILED TO ACTIVATE THE VIRTUAL ENVIRONMENT.
    echo Please check the path: "%VENV_PATH%"
    echo.
    pause
    exit /b
)

echo.
echo --- Starting local web server ---
echo Your application will be available at: http://localhost:8001
echo Press Ctrl+C in this window to stop the server.
echo ---

python -m http.server 8001
