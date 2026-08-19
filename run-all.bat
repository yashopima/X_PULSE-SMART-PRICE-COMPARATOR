@echo off
setlocal

set "ROOT=%~dp0"

echo Starting PricePulse X...
echo.

if not exist "%ROOT%server\package.json" (
  echo Could not find server\package.json.
  pause
  exit /b 1
)

if not exist "%ROOT%client\package.json" (
  echo Could not find client\package.json.
  pause
  exit /b 1
)

start "PricePulse X API" cmd /k "cd /d ""%ROOT%server"" && if not exist node_modules (echo Installing backend dependencies... && npm install) && if exist ""node_modules\.bin\nodemon.cmd"" (call ""node_modules\.bin\nodemon.cmd"" server.js) else (node server.js)"

start "PricePulse X Client" cmd /k "cd /d ""%ROOT%client"" && if not exist node_modules (echo Installing frontend dependencies... && npm install) && npm run dev"

echo Launched backend and frontend in separate windows.
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Keep the opened command windows running while using the app.
pause
