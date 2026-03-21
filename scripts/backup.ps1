# backup.ps1 – Cross-platform backup script for AI Home Hub
#
# Backs up the data directory and SQLite databases to a timestamped zip.
# Maintains 7-day retention (deletes older backups automatically).
#
# Usage:
#   pwsh scripts/backup.ps1
#   pwsh scripts/backup.ps1 -BackupDir /custom/backup/path
#   pwsh scripts/backup.ps1 -RetentionDays 14
#
# Scheduling:
#   Linux/macOS (cron): 0 3 * * * /usr/bin/pwsh /opt/ai-home-hub/scripts/backup.ps1
#   Windows (Task Scheduler): pwsh.exe -File C:\ai-home-hub\scripts\backup.ps1

param(
    [string]$BackupDir = "",
    [int]$RetentionDays = 7
)

$ErrorActionPreference = "Stop"

# Determine paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir

# Default backup directory
if (-not $BackupDir) {
    $BackupDir = Join-Path $RepoRoot "backups"
}

# Data directory (try compose mount, fallback to backend/data)
$DataDir = Join-Path $RepoRoot "data"
if (-not (Test-Path $DataDir)) {
    $DataDir = Join-Path $RepoRoot "backend" "data"
}

if (-not (Test-Path $DataDir)) {
    Write-Host "ERROR: Data directory not found at $DataDir" -ForegroundColor Red
    exit 1
}

# Create backup directory
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    Write-Host "Created backup directory: $BackupDir"
}

# Generate backup filename with timestamp
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupFile = Join-Path $BackupDir "ai-home-hub-backup-$Timestamp.zip"

Write-Host "=== AI Home Hub Backup ==="
Write-Host "  Source:    $DataDir"
Write-Host "  Target:    $BackupFile"
Write-Host "  Retention: $RetentionDays days"
Write-Host ""

# Collect files to backup
$FilesToBackup = @()

# Add data directory contents
if (Test-Path $DataDir) {
    $FilesToBackup += $DataDir
}

# Look for SQLite databases that might be outside data/
$PossibleDbs = @("jobs.db", "resident_state.db")
foreach ($db in $PossibleDbs) {
    $dbPath = Join-Path $RepoRoot "backend" $db
    if (Test-Path $dbPath) {
        $FilesToBackup += $dbPath
    }
    # Also check in data/
    $dbPathData = Join-Path $DataDir $db
    if ((Test-Path $dbPathData) -and ($dbPathData -notin $FilesToBackup)) {
        # Already included via $DataDir, skip
    }
}

# Create zip backup
try {
    Write-Host "Creating backup..."
    Compress-Archive -Path $FilesToBackup -DestinationPath $BackupFile -Force
    $Size = (Get-Item $BackupFile).Length
    $SizeMB = [math]::Round($Size / 1MB, 2)
    Write-Host "  Backup created: $BackupFile ($SizeMB MB)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to create backup: $_" -ForegroundColor Red
    exit 1
}

# Retention: delete backups older than N days
Write-Host ""
Write-Host "Applying retention policy ($RetentionDays days)..."
$CutoffDate = (Get-Date).AddDays(-$RetentionDays)
$OldBackups = Get-ChildItem -Path $BackupDir -Filter "ai-home-hub-backup-*.zip" |
    Where-Object { $_.LastWriteTime -lt $CutoffDate }

if ($OldBackups.Count -gt 0) {
    foreach ($old in $OldBackups) {
        Remove-Item $old.FullName -Force
        Write-Host "  Deleted old backup: $($old.Name)" -ForegroundColor Yellow
    }
    Write-Host "  Removed $($OldBackups.Count) old backup(s)."
} else {
    Write-Host "  No old backups to remove."
}

Write-Host ""
Write-Host "=== Backup complete ==="
