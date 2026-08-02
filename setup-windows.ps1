$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Backend = Join-Path $Root "backend"
$Frontend = Join-Path $Root "frontend"
$CacheRoot = Join-Path $Root ".cache"
$env:PIP_CACHE_DIR = Join-Path $CacheRoot "pip"
$env:npm_config_cache = Join-Path $CacheRoot "npm"
New-Item -ItemType Directory -Force -Path $env:PIP_CACHE_DIR, $env:npm_config_cache | Out-Null

Write-Host "`nReadMark OS local setup" -ForegroundColor Yellow
Write-Host "Project: $Root`n" -ForegroundColor DarkGray

function Require-Command($Name, $Help) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        Write-Host "Missing: $Name" -ForegroundColor Red
        Write-Host $Help -ForegroundColor Gray
        exit 1
    }
}

Require-Command "node" "Install Node.js LTS from https://nodejs.org/"
Require-Command "npm.cmd" "npm is installed with Node.js."

$PythonExe = $null
$CodexPython = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if (Test-Path $CodexPython) {
    $PythonExe = $CodexPython
} else {
    $PythonOnPath = Get-Command python -ErrorAction SilentlyContinue
    if ($PythonOnPath -and $PythonOnPath.Source -notlike "*WindowsApps*") {
        $PythonExe = $PythonOnPath.Source
    }
}
if (-not $PythonExe) {
    Write-Host "Missing: Python" -ForegroundColor Red
    Write-Host "Install Python 3.12 or 3.13 from https://www.python.org/downloads/ and enable Add Python to PATH." -ForegroundColor Gray
    exit 1
}

Write-Host "[1/5] Creating backend virtual environment..." -ForegroundColor Cyan
if (-not (Test-Path (Join-Path $Backend ".venv"))) {
    Push-Location $Backend
    & $PythonExe -m venv .venv
    Pop-Location
}

$VenvPython = Join-Path $Backend ".venv\Scripts\python.exe"
if (-not (Test-Path $VenvPython)) { throw "Virtual environment creation failed." }

Write-Host "[2/5] Installing backend packages..." -ForegroundColor Cyan
& $VenvPython -m pip install --upgrade pip
& $VenvPython -m pip install -r (Join-Path $Backend "requirements.txt")

Write-Host "[3/5] Installing frontend packages..." -ForegroundColor Cyan
Push-Location $Frontend
& npm.cmd install --registry=https://registry.npmjs.org/
Pop-Location

Write-Host "[4/5] Creating local environment files..." -ForegroundColor Cyan
$BackendEnv = Join-Path $Backend ".env"
$FrontendEnv = Join-Path $Frontend ".env"
if (-not (Test-Path $BackendEnv)) { Copy-Item (Join-Path $Backend ".env.example") $BackendEnv }
if (-not (Test-Path $FrontendEnv)) { Copy-Item (Join-Path $Frontend ".env.example") $FrontendEnv }

Write-Host "[5/5] Running validation..." -ForegroundColor Cyan
& $VenvPython -m pytest (Join-Path $Backend "tests") -q
Push-Location $Frontend
& npm.cmd run build
Pop-Location

Write-Host "`nSetup complete." -ForegroundColor Green
Write-Host "Run start-local.bat to open the app." -ForegroundColor Yellow
Write-Host "Owner login: admin@example.com / ChangeMe123!" -ForegroundColor Gray
