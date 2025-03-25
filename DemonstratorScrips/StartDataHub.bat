@echo off
cd /d "C:\WS\DataHub"
echo Beende bestehenden DataHub (falls vorhanden)...
docker compose down
echo Starte Docker Stack...
docker compose up -d


docker rm xvisualhub -f
docker run -d --name xvisualhub -d -p 5080:8082  -e ASPNETCORE_HTTP_PORTS=8082 mr4socontainerreg.azurecr.io/xrdatahubwebapp
pause