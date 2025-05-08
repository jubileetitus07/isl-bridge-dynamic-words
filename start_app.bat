
@echo off
echo Starting ISL Translator Application...
echo.

echo Starting Backend Server...
start cmd /k "cd backend && python -m pip install -r requirements.txt && python app.py"

echo Waiting for backend to initialize (10 seconds)...
timeout /t 10 /nobreak > nul

echo Starting Frontend Server...
start cmd /k "npm run dev"

echo.
echo ISL Translator started!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
echo.
echo Press any key to stop all servers...
pause > nul

echo Stopping servers...
taskkill /F /FI "WindowTitle eq *backend*" > nul
taskkill /F /FI "WindowTitle eq *npm run dev*" > nul
echo Application stopped.
