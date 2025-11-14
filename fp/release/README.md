# Proyecto Carpooling Solidario "CaminoComún"

Este documento contiene las instrucciones para desplegar y ejecutar el proyecto en un entorno de producción local utilizando Docker.

## Requisitos Previos

- Tener instalado [Docker](https://www.docker.com/products/docker-desktop/).

## Instrucciones de Despliegue

1.  **Clonar o descargar el proyecto**: Asegúrese de tener todos los archivos del proyecto en una carpeta en su ordenador.

2.  **Ejecutar el script de construccion del entorno**:
    -   Navegue a la carpeta `release` dentro del proyecto.
    -   Si está en **Windows**, ejecute el archivo `deploy.bat` haciendo doble clic en él o ejecutándolo desde una terminal.
    -   Si está en **Linux** o **macOS**, abra una terminal en la carpeta `release` y ejecute el comando: `./deploy.sh`.

    Este script se encargará de construir las imágenes de Docker y levantar todos los servicios necesarios.

3.  **Acceder a la Aplicación**:
    -   Una vez que el script termine, abra su navegador web y vaya a la siguiente dirección:
        > **http://localhost:4000**

    Ahí encontrará la interfaz de la aplicación web lista para usar.

## Servicios Adicionales

-   **phpMyAdmin**: Se puede acceder a la interfaz de gestión de la base de datos en `http://localhost:8080`.

## Cómo Detener la Aplicación

Para detener todos los servicios, puede ejecutar el comando `docker-compose down` en la raíz del proyecto, o simplemente apagar Docker Desktop.
