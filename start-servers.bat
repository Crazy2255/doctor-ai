@echo off
echo Starting Clinic Management System...
echo.

echo Starting Backend Server...
cd backend-node
start "Backend Server" cmd /k "npm start"
echo Backend server starting on http://localhost:8000
echo.

echo Starting Frontend Server...
cd ../frontend
start "Frontend Server" cmd /k "npm start"
echo Frontend server starting on http://localhost:3000
echo.

echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo You can close this window once both servers are running.
pause
