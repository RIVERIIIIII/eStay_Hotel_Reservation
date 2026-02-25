# Simple script to check Git functionality

# Set variables
$BackendDir = "d:\MyDoc\Hotel-Assistant\backend"
$TestFile = "d:\MyDoc\Hotel-Assistant\git_test.txt"

# Clear existing test file
if (Test-Path $TestFile) {
    Remove-Item $TestFile -Force
}

# Function to write to test file
function Write-TestFile {
    param(
        [string]$Message
    )
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] $Message"
    Add-Content -Path $TestFile -Value $LogMessage
    Write-Host $LogMessage
}

# Start testing
Write-TestFile "=== Starting Git Test ==="
Write-TestFile "Backend directory: $BackendDir"
Write-TestFile "Test file: $TestFile"

# Check if Git is installed
Write-TestFile "Checking Git installation..."
try {
    $GitVersion = git --version 2>&1
    Write-TestFile "Git version: $GitVersion"
} catch {
    Write-TestFile "ERROR: Git not found or not in PATH"
    exit 1
}

# Check current directory
Write-TestFile "Current directory: $(Get-Location)"

# Check backend directory exists
Write-TestFile "Checking backend directory..."
if (Test-Path $BackendDir -PathType Container) {
    Write-TestFile "Backend directory exists"
} else {
    Write-TestFile "ERROR: Backend directory not found"
    exit 1
}

# Try a simple Git command in backend directory
Write-TestFile "Trying simple Git command in backend directory..."
Set-Location $BackendDir
$GitStatus = git status 2>&1
Write-TestFile "Git status result: $GitStatus"

# Try to create a simple file and see if we can add/commit
Write-TestFile "Creating test file..."
Set-Content -Path "$BackendDir\test_git.txt" -Value "Test content"
Write-TestFile "Test file created"

# Try Git init
Write-TestFile "Trying Git init..."
$GitInit = git init 2>&1
Write-TestFile "Git init result: $GitInit"

# Try Git add
Write-TestFile "Trying Git add..."
$GitAdd = git add test_git.txt 2>&1
Write-TestFile "Git add result: $GitAdd"

# End test
Write-TestFile "=== Git Test Complete ==="
Write-Host "\nTest results saved to: $TestFile"
Write-Host "To view results: type $TestFile"
