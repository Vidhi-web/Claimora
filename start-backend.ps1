# =============================================================================
# Claimora — Backend Startup Script (Supabase PostgreSQL)
# Run this instead of the old dev-profile command.
# =============================================================================

Write-Host "Loading environment from .env..." -ForegroundColor Cyan

# Load .env from project root
$envFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and !$line.StartsWith("#")) {
            $parts = $line -split "=", 2
            if ($parts.Length -eq 2) {
                $key   = $parts[0].Trim()
                $value = $parts[1].Trim()
                [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
                Write-Host "  SET $key" -ForegroundColor Gray
            }
        }
    }
    Write-Host ".env loaded successfully." -ForegroundColor Green
} else {
    Write-Host "ERROR: .env file not found at $envFile" -ForegroundColor Red
    Write-Host "Create it from .env.example or paste your Supabase credentials." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Starting Claimora backend (Supabase PostgreSQL)..." -ForegroundColor Cyan
Write-Host "  DB: $env:DB_URL" -ForegroundColor Gray
Write-Host ""

# Start Spring Boot WITHOUT dev profile → uses application.properties → Supabase
Set-Location "$PSScriptRoot\backend"
.\mvnw.cmd spring-boot:run
