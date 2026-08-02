$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Backend = Join-Path $Root "backend"
$Frontend = Join-Path $Root "frontend"
$VenvPython = Join-Path $Backend ".venv\Scripts\python.exe"
$env:npm_config_cache = Join-Path $Root ".cache\npm"

if (-not (Test-Path $VenvPython)) {
    Write-Host "Run setup-windows.bat first." -ForegroundColor Red
    exit 1
}
if (-not (Test-Path (Join-Path $Frontend "node_modules"))) {
    Write-Host "Frontend packages are missing. Run setup-windows.bat first." -ForegroundColor Red
    exit 1
}

$BackendCommand = "Set-Location '$Backend'; & '$VenvPython' -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $BackendCommand | Out-Null
Start-Sleep -Seconds 2

Write-Host "Backend: http://localhost:8000" -ForegroundColor Green
Write-Host "API docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Start-Process "http://localhost:5173"

Push-Location $Frontend
& npm.cmd run dev
Pop-Location
