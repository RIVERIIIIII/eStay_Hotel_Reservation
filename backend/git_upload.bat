@echo off

rem Set working directory
cd /d "d:\MyDoc\Hotel-Assistant\backend"

echo Starting Git upload at %date% %time%

rem Initialize Git repository
echo 1. Initializing Git repository...
git init >> git_upload.log 2>&1

rem Add all files
echo 2. Adding all files...
git add . >> git_upload.log 2>&1

rem Commit changes
echo 3. Committing changes...
git commit -m "Update backend code" >> git_upload.log 2>&1

rem Add remote origin
echo 4. Adding remote origin...
git remote add origin https://github.com/RIVERIIIIII/eStay_Hotel_Reservation.git >> git_upload.log 2>&1

rem Push to backend branch
echo 5. Pushing to backend branch...
git push -u origin backend >> git_upload.log 2>&1

echo Git upload completed at %date% %time%
echo Check git_upload.log for detailed results
