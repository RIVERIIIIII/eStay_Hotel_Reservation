# Direct Git commands script

Write-Host "=== Starting Direct Git Upload ==="

# Step 1: Navigate to backend directory
Write-Host "1. Navigating to backend directory..."
Set-Location -Path "d:\MyDoc\Hotel-Assistant\backend"
Write-Host "Current directory: $(Get-Location)"

# Step 2: Initialize Git repository
Write-Host "\n2. Initializing Git repository..."
git init

# Step 3: Add all files
Write-Host "\n3. Adding all files..."
git add .

# Step 4: Commit changes
Write-Host "\n4. Committing changes..."
git commit -m "第五版：实现时间排序"

# Step 5: Add remote repository
Write-Host "\n5. Adding remote repository..."
git remote add origin https://github.com/RIVERIIIIII/eStay_Hotel_Reservation.git

# Step 6: Push to backend branch
Write-Host "\n6. Pushing to backend branch..."
git push -u origin backend

Write-Host "\n=== Git Upload Completed ==="
