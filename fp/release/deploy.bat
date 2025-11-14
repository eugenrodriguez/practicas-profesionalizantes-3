@echo off
echo "Iniciando el proceso de despliegue para produccion..."

cd /d "%~dp0..\."

echo "Construyendo las imagenes de Docker..."
docker-compose build

echo "Iniciando los servicios en modo detached (segundo plano)..."
docker-compose up -d

echo "Despliegue completo."
echo "Para ver los logs, ejecuta 'docker-compose logs -f'"
echo "Para detener los servicios, ejecuta 'docker-compose down'"
