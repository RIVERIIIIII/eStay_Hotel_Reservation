# PowerShell script to upload backend code to GitHub

# Set absolute paths
$BackendDir = "d:\MyDoc\Hotel-Assistant\backend"
$LogFile = "d:\MyDoc\Hotel-Assistant\upload_log.txt"

# Clear any existing log
if (Test-Path $LogFile) {
    Remove-Item $LogFile -Force
}

# Function to write log with timestamp
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [$Level] $Message"
    Add-Content -Path $LogFile -Value $LogMessage
    Write-Host $LogMessage
}

# Start upload process
Write-Log "=== Starting Backend Code Upload ==="
Write-Log "Backend directory: $BackendDir"
Write-Log "Log file: $LogFile"

# Navigate to backend directory
Write-Log "Changing to backend directory..."
Set-Location -Path $BackendDir

# Check Git installation
Write-Log "Checking Git installation..."
try {
    $GitVersion = git --version 2>&1
    Write-Log "Git version: $GitVersion"
} catch {
    Write-Log "ERROR: Git is not installed or not in PATH" "ERROR"
    exit 1
}

# Remove existing .git if present
if (Test-Path -Path ".git" -PathType Container) {
    Write-Log "Removing existing .git directory..."
    Remove-Item -Path ".git" -Recurse -Force
}

# Initialize Git repository
Write-Log "Initializing Git repository..."
$InitResult = git init 2>&1
Write-Log "Git init result: $InitResult"

# Add all files
Write-Log "Adding all files to Git..."
$AddResult = git add . 2>&1
Write-Log "Git add result: $AddResult"

# Commit changes
Write-Log "Committing changes..."
$CommitResult = git commit -m "Update backend code" 2>&1
Write-Log "Git commit result: $CommitResult"

# Add remote repository
Write-Log "Adding remote repository..."
$RemoteResult = git remote add origin https://github.com/RIVERIIIIII/eStay_Hotel_Reservation.git 2>&1
Write-Log "Git remote add result: $RemoteResult"

# Push to backend branch
Write-Log "Pushing to backend branch..."
$PushResult = git push -u origin backend 2>&1
Write-Log "Git push result: $PushResult"

# Verify push
Write-Log "Verifying push..."
$StatusResult = git status 2>&1
Write-Log "Git status: $StatusResult"

Write-Log "=== Upload Process Complete ==="
Write-Host "\nCheck the log file at: $LogFile"
Write-Host "\nLast 10 lines of log:"
Get-Content -Path $LogFile -Tail 10
