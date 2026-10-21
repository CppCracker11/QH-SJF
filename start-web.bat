@echo off
setlocal
start "QH-SJF API" powershell -NoExit -ExecutionPolicy Bypass -Command "Set-Location '%~dp0api'; .\start.ps1"
start "QH-SJF Frontend" powershell -NoExit -Command "Set-Location '%~dp0frontend'; if (!(Test-Path 'node_modules')) { npm install; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }; npm run dev"
echo Open http://127.0.0.1:5173 after both services start.
