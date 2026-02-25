@echo off

rem Disable paging
set GIT_PAGER=cat
set LESS="-F -X"

rem Set working directory
cd /d d:\MyDoc\Hotel-Assistant\backend

echo === Starting simple Git upload ===
echo Current directory: %CD%

echo 1. Initializing Git...
git init

echo 2. Adding files...
git add .

echo 3. Committing...
git commit -m "第五版：实现时间排序"

echo 4. Adding remote...
git remote add origin https://github.com/RIVERIIIIII/eStay_Hotel_Reservation.git

echo 5. Pushing...
git push -u origin backend

echo === Git upload completed ===
