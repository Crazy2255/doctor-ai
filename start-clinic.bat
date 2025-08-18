@echo off
echo ======================================
echo   Clinic Management System Startup
echo ======================================
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d "%~dp0" && start-backend.bat"

timeout /t 3 /nobreak >nul

echo Starting Frontend Development Server...
start "Frontend Server" cmd /k "cd /d "%~dp0frontend" && npm start"

echo.
echo ======================================
echo   Servers are starting...
echo ======================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Login Credentials:
echo Email: Admin@gmail.com
echo Password: Admin1234
echo.
echo Press any key to close this window...
pause >nul
