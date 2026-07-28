# Green Git Today Script (PowerShell)
# Helper tool to make today's Git repository activity bright green!

param (
    [string]$Message = "feat(git): boost today's git activity to bright green"
)

Write-Host "==========================================" -ForegroundColor Green
Write-Host " 🟢 Making Today's Git Bright Green!      " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

$logPath = "docs/git-activity.log"

if (-not (Test-Path -Path "docs")) {
    New-Item -ItemType Directory -Path "docs" | Out-Null
}

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz"
$logEntry = "[$timestamp] 🟢 Bright Green Commit Activity logged: $Message"

Add-Content -Path $logPath -Value $logEntry

Write-Host "Updated $logPath with entry:" -ForegroundColor Yellow
Write-Host "  $logEntry" -ForegroundColor Cyan

git add $logPath
git commit -m "$Message"

Write-Host "`n✅ Successfully logged git activity and created commit for today!" -ForegroundColor Green
