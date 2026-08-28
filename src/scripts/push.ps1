# 💻 RUN THIS ON YOUR WINDOWS LAPTOP
$SERVER_IP = "144.24.7.172"
$KEY_PATH = ".\ssh-key-2026-08-23.key"
$PROJECT_DIR = "/home/ubuntu/PowerToThePeople"

Write-Host "🚀 Starting Automated Deployment Pipeline..." -ForegroundColor Cyan

# Step 1: Export your local MySQL database structure and data
Write-Host "📦 Exporting local database to dump.sql..." -ForegroundColor Yellow
mysqldump -u root -p power_to_the_people > dump.sql

# Step 2: Upload the database dump file to your cloud server
Write-Host "📤 Uploading dump.sql to remote server..." -ForegroundColor Yellow
scp -i $KEY_PATH .\dump.sql "ubuntu@${SERVER_IP}:${PROJECT_DIR}/"

# Step 3: Push latest code changes to Git
Write-Host "💾 Pushing latest code changes to Git..." -ForegroundColor Yellow
git add .
git commit -m "Automated deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push origin main

# Step 4: Trigger the remote server deployment script via SSH
Write-Host "⚡ Triggering remote server deployment script..." -ForegroundColor Green
ssh -i $KEY_PATH "ubuntu@${SERVER_IP}" "bash ${PROJECT_DIR}/deploy.sh"

Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
