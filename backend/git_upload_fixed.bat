@echo off

rem Set working directory
set "BACKEND_DIR=d:\MyDoc\Hotel-Assistant\backend"
set "LOG_FILE=%BACKEND_DIR%\git_upload.log"

rem Clear log file
echo. > %LOG_FILE%

echo Starting Git upload at %date% %time% >> %LOG_FILE%
echo Working directory: %BACKEND_DIR% >> %LOG_FILE%

echo Changing to backend directory... >> %LOG_FILE%
cd /d "%BACKEND_DIR%"

rem Step 1: Check if we're in a git repo
if not exist .git (    
    echo Step 1: Initializing new Git repository... >> %LOG_FILE%
    git init >> %LOG_FILE% 2>&1
    if errorlevel 1 (        
        echo ERROR: Git init failed! >> %LOG_FILE%
        goto end
    )
) else (
    echo Step 1: Already a Git repository >> %LOG_FILE%
)

rem Step 2: Add all files
echo Step 2: Adding all files... >> %LOG_FILE%
git add . >> %LOG_FILE% 2>&1
if errorlevel 1 (
    echo ERROR: Git add failed! >> %LOG_FILE%
    goto end
)

rem Step 3: Commit changes
echo Step 3: Committing changes... >> %LOG_FILE%
git commit -m "第五版：实现时间排序" >> %LOG_FILE% 2>&1
if errorlevel 1 (
    echo ERROR: Git commit failed! >> %LOG_FILE%
    goto end
)

rem Step 4: Add/Update remote
echo Step 4: Checking remote... >> %LOG_FILE%
git remote -v >> %LOG_FILE% 2>&1

rem Check if origin exists
git remote show origin >nul 2>&1
if errorlevel 1 (
    echo Adding remote origin... >> %LOG_FILE%
    git remote add origin https://github.com/RIVERIIIIII/eStay_Hotel_Reservation.git >> %LOG_FILE% 2>&1
    if errorlevel 1 (
        echo ERROR: Git remote add failed! >> %LOG_FILE%
        goto end
    )
) else (
    echo Updating remote origin... >> %LOG_FILE%
    git remote set-url origin https://github.com/RIVERIIIIII/eStay_Hotel_Reservation.git >> %LOG_FILE% 2>&1
    if errorlevel 1 (
        echo ERROR: Git remote set-url failed! >> %LOG_FILE%
        goto end
    )
)

rem Step 5: Push to backend branch
echo Step 5: Pushing to backend branch... >> %LOG_FILE%
git push -u origin backend >> %LOG_FILE% 2>&1
if errorlevel 1 (
    echo ERROR: Git push failed! >> %LOG_FILE%
    goto end
)

echo SUCCESS: All Git operations completed! >> %LOG_FILE%

echo Git upload completed successfully at %date% %time% >> %LOG_FILE%

:end
echo === Log file created: %LOG_FILE% ===
echo === To view log: type %LOG_FILE% ===
