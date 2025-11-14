> # **DOCUMENTACIÓN DE LA API - CaminoComun**

CaminoComun es una plataforma de carpooling (viajes compartidos) diseñada para conectar a conductores con asientos disponibles en sus vehículos y pasajeros que buscan un viaje hacia un destino común. Esta API proporciona todos los endpoints necesarios para gestionar usuarios (conductores y pasajeros), crear, buscar y seguir viajes en tiempo real, administrar solicitudes de reserva, y manejar calificaciones entre usuarios, facilitando una experiencia de viaje colaborativa, solidaria, eficiente y amigable con el ambiente.

**URL Base:** `/api/v1`

---

## ENDPOINTS DE AUTENTICACIÓN

---

### Endpoint: `/auth/register/driver`
*   **Descripción:** Registra un nuevo usuario con el rol de conductor. Requiere datos específicos del conductor como licencia y vehículo.
*   **Método HTTP:** `POST`
*   **Formato Serializacion:** JSON
*   **Cabecera entrada:** `Content-Type: application/json`
*   **Cabecera salida:** `Set-Cookie: jwt=... (HttpOnly)`

#### Estructura de datos IN:
```json
{
    "name": "Nombre Conductor",
    "email": "conductor@example.com",
    "password": "password123",
    "licencia": "12345678",
    "patente": "AB123CD",
    "vehiculo": "Toyota Corolla"
}
```

#### Estructura de datos OUT (201 Created):
```json
{
    "message": "Registro de conductor exitoso",
    "user": {
        "id": 1,
        "name": "Nombre Conductor",
        "email": "conductor@example.com",
        "roles": ["conductor"]
    }
}
```

#### Estructura de datos ERR (400/500):
```json
{
    "error": "El email ya está registrado"
}
```

---

### Endpoint: `/auth/register/passenger`
*   **Descripción:** Registra un nuevo usuario con el rol de pasajero. Requiere datos personales como teléfono y dirección.
*   **Método HTTP:** `POST`
*   **Formato Serializacion:** JSON
*   **Cabecera entrada:** `Content-Type: application/json`
*   **Cabecera salida:** `Set-Cookie: jwt=... (HttpOnly)`

#### Estructura de datos IN:
```json
{
    "name": "Nombre Pasajero",
    "email": "pasajero@example.com",
    "password": "password123",
    "telefono": "1122334455",
    "direccion": "Calle Ejemplo 123"
}
```

#### Estructura de datos OUT (201 Created):
```json
{
    "message": "Registro de pasajero exitoso",
    "user": {
        "id": 2,
        "name": "Nombre Pasajero",
        "email": "pasajero@example.com",
        "roles": ["pasajero"]
    }
}
```

#### Estructura de datos ERR (400/500):
```json
{
    "error": "El email ya está registrado"
}
```

---

### Endpoint: `/auth/login`
*   **Descripción:** Inicia sesión para un usuario existente (conductor o pasajero) y establece una cookie JWT para la autenticación en las siguientes peticiones.
*   **Método HTTP:** `POST`
*   **Formato Serializacion:** JSON
*   **Cabecera entrada:** `Content-Type: application/json`
*   **Cabecera salida:** `Set-Cookie: jwt=... (HttpOnly)`

#### Estructura de datos IN:
```json
{
    "email": "usuario@example.com",
    "password": "password123"
}
```

#### Estructura de datos OUT (200 OK):
```json
{
    "message": "Inicio de sesión exitoso",
    "user": {
        "id": 1,
        "name": "Nombre Usuario",
        "roles": ["conductor", "pasajero"]
    }
}
```

#### Estructura de datos ERR (401 Unauthorized):
```json
{
    "error": "Email o contraseña incorrectos"
}
```

---

### Endpoint: `/auth/logout`
*   **Descripción:** Cierra la sesión del usuario actual invalidando la cookie JWT.
*   **Método HTTP:** `POST`
*   **Formato Serializacion:** JSON
*   **Cabecera entrada:** `Cookie: jwt=...`
*   **Cabecera salida:** `Set-Cookie: jwt=...` (con fecha de expiración pasada)

#### Estructura de datos IN:
`-`

#### Estructura de datos OUT (200 OK):
```json
{
    "message": "Sesión cerrada exitosamente"
}
```

#### Estructura de datos ERR:
`-`

---

### Endpoint: `/status`
*   **Descripción:** Verifica el estado de autenticación del usuario a través de la cookie JWT y devuelve los datos del usuario si está autenticado.
*   **Método HTTP:** `GET`
*   **Formato Serializacion:** JSON
*   **Cabecera entrada:** `Cookie: jwt=...`
*   **Cabecera salida:** `-`

#### Estructura de datos IN:
`-`

#### Estructura de datos OUT (200 OK):
```json
{
    "isAuthenticated": true,
    "user": {
        "id": 1,
        "name": "Nombre Usuario",
        "email": "usuario@example.com",
        "roles": ["conductor", "pasajero"]
    }
}
```

#### Estructura de datos ERR (401 Unauthorized si el token es inválido):
```json
{
    "error": "No autorizado"
}
```

---

## ENDPOINTS DE PERFILES

---

### Endpoint: `/profiles/me`
*   **Descripción:** Obtiene el perfil completo del usuario autenticado, incluyendo datos personales y de conductor/pasajero.
*   **Método HTTP:** `GET`
*   **Formato Serializacion:** JSON
*   **Cabecera entrada:** `Cookie: jwt=...`
*   **Cabecera salida:** `-`

#### Estructura de datos IN:
`-`

#### Estructura de datos OUT (200 OK):
```json
{
    "success": true,
    "user": {
        "id": 1,
        "name": "Nombre Usuario",
        "email": "usuario@example.com",
        "calificacion_promedio": "4.50",
        "telefono": "22312345678",
        "direccion": "Calle Ejemplo 123",
        "licencia": "12345678",
        "patente": "AB123CD",
        "vehiculo": "Toyota Corolla"
    }
}
```

#### Estructura de datos ERR (500):
```json
{
    "error": "Error al obtener el perfil"
}
```

---

### Endpoint: `/profiles/me`
*   **Descripción:** Actualiza la información del perfil del usuario autenticado. Permite cambiar datos personales y la contraseña (si se proporcionan `currentPassword` y `newPassword`).
*   **Método HTTP:** `PUT`
*   **Formato Serializacion:** JSON
*   **Cabecera entrada:** `Cookie: jwt=...` , `Content-Type: application/json`
*   **Cabecera salida:** `-`

#### Estructura de datos IN:
```json

{
    "name": "Nuevo Nombre",
    "telefono": "5544332211",
    "direccion": "Avenida ejemplo 742",
    "currentPassword": "password_actual_123",
    "newPassword": "nueva_password_456"
}
```

#### Estructura de datos OUT (200 OK):
```json
{
    "success": true,
    "message": "Perfil actualizado correctamente"
}
```

#### Estructura de datos ERR (500):
```json
{
    "error": "Error al actualizar el perfil"
}
```

---

### Endpoint: `/profiles/me/trips`
*   **Descripción:** Obtiene una lista de todos los viajes creados por el usuario autenticado (rol de conductor).
*   **Método HTTP:** `GET`
*   **Formato Serializacion:** JSON
*   **Cabecera entrada:** `Cookie: jwt=...`
*   **Cabecera salida:** `-`

#### Estructura de datos IN:
`-`

#### Estructura de datos OUT (200 OK):
```json
{
    "success": true,
    "trips": [
        {
            "id": 1,
            "origen": "Avenida Luro 1200, Mar del Plata",
            "destino": "Avenida Constitucion 4000, Mar del Plata",
            "fecha_salida": "2024-10-20T10:00:00.000Z",
            "asientos_disponibles": 3,
            "precio": 1500,
            "estado": "activo",
            "solicitudes_pendientes": 2
        }
    ]
}
```

#### Estructura de datos ERR (500):
```json
{
    "error": "Error al obtener los viajes del usuario"
}
```

---

## ENDPOINTS DE VIAJES Y SOLICITUDES

---

### Endpoint: `/trips`
*   **Descripción:** Permite a un conductor crear un nuevo viaje. El viaje se crea con estado 'pendiente' por defecto.
*   **Método HTTP:** `POST`
*   **Formato Serializacion:** JSON
*   **Cabecera entrada:** `Cookie: jwt=...` , `Content-Type: application/json`
*   **Cabecera salida:** `-`

#### Estructura de datos IN:
```json
{
    "origen": "Centro Comercial Los Gallegos, Mar del Plata",
    "destino": "Avenida Luro 1200, Mar del Plata",
    "origen_lat": -38.0055,
    "origen_lng": -57.5426,
    "destino_lat": -38.0023,
    "destino_lng": -57.5575,
    "waypoints": [
        { "lat": -38.0040, "lng": -57.5500, "address": "Parada Intermedia 1" }
    ],
    "fecha_salida": "2024-10-20 10:00:00",
    "asientos_disponibles": 3,
    "precio": 1500
}
```

#### Estructura de datos OUT (201 Created):
```json
{
    "success": true,
    "message": "Viaje creado con éxito",
    "tripId": 123
}
```

#### Estructura de datos ERR (400/500):
```json
{
    "error": "Faltan datos para crear el viaje"
}
```

---

### Endpoint: `/trips/search`
*   **Descripción:** Busca viajes disponibles que coincidan con los filtros de origen, destino y fecha proporcionados como query params.
*   **Método HTTP:** `GET`
*   **Formato Serializacion:** JSON
*   **Cabecera entrada:** `Cookie: jwt=...`
*   **Cabecera salida:** `-`

#### Estructura de datos IN (Query Params):
`/trips/search?origen=Buenos%20Aires&destino=Rosario&fecha=2024-10-20`

#### Estructura de datos OUT (200 OK):
```json
{
    "success": true,
    "trips": [
        {
            "id": 1,
            "origen": "Avenida Luro 1200, Mar del Plata",
            "destino": "Avenida Constitucion 4000, Mar del Plata",
            "fecha_salida": "2024-10-20T10:00:00.000Z",
            "asientos_disponibles": 3,
            "precio": 1500,
            "conductor_name": "Nombre Conductor",
            "conductor_rating": "4.8"
        }
    ]
}
```

#### Estructura de datos ERR (500):
```json
{
    "error": "Error al buscar viajes"
}
```

---

### Endpoint: `/trips/available`
*   **Descripción:** Obtiene una lista de todos los viajes que están 'activos' y tienen asientos disponibles, sin necesidad de filtros.
*   **Método HTTP:** `GET`
*   **Formato Serializacion:** JSON
*   **Cabecera entrada:** `Cookie: jwt=...`
*   **Cabecera salida:** `-`

#### Estructura de datos IN:
`-`

#### Estructura de datos OUT (200 OK):
```json
{
    "success": true,
    "trips": [
        {
            "id": 1,
            "origen": "Avenida Luro 1200, Mar del Plata",
            "destino": "Avenida Constitucion 4000, Mar del Plata",
            "fecha_salida": "2024-10-20T10:00:00.000Z",
            "asientos_disponibles": 3,
            "precio": 1500,
            "conductor_name": "Nombre Conductor",
            "conductor_rating": "4.8"
        }
    ]
}
```

#### Estructura de datos ERR (500):
```json
{
    "error": "Error al obtener viajes disponibles"
}
```

---

### Endpoint: `/trips/my-requests`
*   **Descripción:** Devuelve todas las solicitudes de reserva (aceptadas, pendientes, etc.) realizadas por el pasajero autenticado.
*   **Método HTTP:** `GET`
*   **Formato Serializacion:** JSON
*   **Cabecera entrada:** `Cookie: jwt=...`
*   **Cabecera salida:** `-`

#### Estructura de datos IN:
`-`

#### Estructura de datos OUT (200 OK):
```json
{
    "success": true,
    "requests": [
        {
            "id_solicitud": 5,
            "id_viaje": 1,
            "origen": "Avenida Luro 1200, Mar del Plata",
            "destino": "Avenida Constitucion 4000, Mar del Plata",
            "fecha_salida": "2024-10-20T10:00:00.000Z",
            "estado": "aceptada",
            "conductor_name": "Nombre Conductor"
        }
    ]
}
```

#### Estructura de datos ERR (500):
```json
{
    "error": "Error al obtener tus solicitudes"
}
```

---

### Endpoint: `/trips/:id`
*   **Descripción:** Obtiene los detalles completos de un viaje específico por su ID, incluyendo información del conductor y la lista de pasajeros confirmados.
*   **Método HTTP:** `GET`
*   **Formato Serializacion:** JSON
*   **Cabecera entrada:** `Cookie: jwt=...`
*   **Cabecera salida:** `-`

#### Estructura de datos IN (Path Param):
`/trips/1`

#### Estructura de datos OUT (200 OK):
```json
{
    "success": true,
    "trip": {
        "id": 1,
        "origen": "Avenida Luro 1200, Mar del Plata",
            "destino": "Avenida Constitucion 4000, Mar del Plata",
        "fecha_salida": "2024-10-20T10:00:00.000Z",
        "asientos_disponibles": 3,
        "precio": 1500,
        "estado": "activo",
        "conductor": { "id": 10, "name": "Nombre Conductor" },
        "pasajeros": [ { "id": 20, "name": "Nombre Pasajero" } ]
    }
}
```

#### Estructura de datos ERR (404/500):
```json
{
    "error": "Viaje no encontrado"
}
```

---

### Endpoint: `/trips/:id`
*   **Descripción:** Elimina un viaje. Solo el conductor que creó el viaje puede eliminarlo, y únicamente si el viaje está en estado 'pendiente'.
*   **Método HTTP:** `DELETE`
*   **Formato Serializacion:** JSON
*   **Cabecera entrada:** `Cookie: jwt=...`
*   **Cabecera salida:** `-`

#### Estructura de datos IN (Path Param):
`/trips/1`

#### Estructura de datos OUT (200 OK):
```json
{
    "success": true,
    "message": "Viaje eliminado correctamente"
}
```

#### Estructura de datos ERR (403/404/500):
```json
{
    "error": "No tienes permiso para eliminar este viaje"
}
```

---

### Endpoint: `/trips/:id/requests`
*   **Descripción:** Permite a un pasajero solicitar uno o más asientos en un viaje específico.
*   **Método HTTP:** `POST`
*   **Formato Serializacion:** JSON
*   **Cabecera entrada:** `Cookie: jwt=...` , `Content-Type: application/json`
*   **Cabecera salida:** `-`

#### Estructura de datos IN (Path Param + Body):
`/trips/1`
```json
{
    "asientos_solicitados": 2
}
```

#### Estructura de datos OUT (201 Created):
```json
{
    "success": true,
    "message": "Solicitud de asiento enviada correctamente"
}
```

#### Estructura de datos ERR (400/404/500):
```json
{
    "error": "No hay suficientes asientos disponibles"
}
```

---

### Endpoint: `/trips/:id/requests`
*   **Descripción:** Obtiene todas las solicitudes de asientos para un viaje específico. Solo el conductor del viaje puede acceder a esta información.
*   **Método HTTP:** `GET`
*   **Formato Serializacion:** JSON
*   **Cabecera entrada:** `Cookie: jwt=...`
*   **Cabecera salida:** `-`

#### Estructura de datos IN (Path Param):
`/trips/1`

#### Estructura de datos OUT (200 OK):
```json
{
    "success": true,
    "requests": [
        {
            "id_solicitud": 5,
            "pasajero_name": "Nombre Pasajero",
            "asientos_solicitados": 1,
            "estado": "pendiente"
        }
    ]
}
```

#### Estructura de datos ERR (403/404/500):
```json
{
    "error": "No tienes permiso para ver las solicitudes de este viaje"
}
```

---

### Endpoint: `/trips/:id/status`
*   **Descripción:** Actualiza el estado de un viaje (ej: de 'pendiente' a 'activo'). Solo el conductor del viaje puede realizar esta acción.
*   **Método HTTP:** `PUT`
*   **Formato Serializacion:** JSON
*   **Cabecera entrada:** `Cookie: jwt=...` , `Content-Type: application/json`
*   **Cabecera salida:** `-`

#### Estructura de datos IN (Path Param + Body):
`/trips/1`
```json
{
    "status": "activo"
}
```

#### Estructura de datos OUT (200 OK):
```json
{
    "success": true,
    "message": "Estado del viaje actualizado a activo"
}
```

#### Estructura de datos ERR (400/403/500):
```json
{
    "error": "No se pudo actualizar el estado del viaje"
}
```

---

### Endpoint: `/trips/:id/cancel`
*   **Descripción:** Permite al conductor cancelar un viaje que ya estaba 'activo'. 
*   **Método HTTP:** `PUT`
*   **Formato Serializacion:** JSON
*   **Cabecera entrada:** `Cookie: jwt=...`
*   **Cabecera salida:** `-`

#### Estructura de datos IN (Path Param):
`/trips/1`

#### Estructura de datos OUT (200 OK):
```json
{
    "success": true,
    "message": "Viaje cancelado correctamente"
}
```

#### Estructura de datos ERR (403/404/500):
```json
{
    "error": "No se pudo cancelar el viaje"
}
```

---

### Endpoint: `/trips/requests/:id`
*   **Descripción:** Permite al conductor 'aceptar' o 'rechazar' una solicitud de asiento específica.
*   **Método HTTP:** `PUT`
*   **Formato Serializacion:** JSON
*   **Cabecera entrada:** `Cookie: jwt=...` , `Content-Type: application/json`
*   **Cabecera salida:** `-`

#### Estructura de datos IN (Path Param + Body):
`/trips/requests/5`
```json
{
    "action": "aceptar"
}
```
*Nota: `action` también puede ser `"rechazar"`.*

#### Estructura de datos OUT (200 OK):
```json
{
    "success": true,
    "message": "Solicitud aceptada"
}
```

#### Estructura de datos ERR (400/403/500):
```json
{
    "error": "No se pudo responder a la solicitud"
}
```

---

### Endpoint: `/trips/requests/:id/cancel`
*   **Descripción:** Permite a un pasajero cancelar su propia reserva en un viaje.
*   **Método HTTP:** `POST`
*   **Formato Serializacion:** JSON
*   **Cabecera entrada:** `Cookie: jwt=...`
*   **Cabecera salida:** `-`

#### Estructura de datos IN (Path Param):
`/trips/requests/5/cancel`

#### Estructura de datos OUT (200 OK):
```json
{
    "success": true,
    "message": "Reserva cancelada correctamente"
}
```

#### Estructura de datos ERR (403/404/500):
```json
{
    "error": "No se pudo cancelar la reserva"
}
```

---

## ENDPOINTS DE CALIFICACIONES

---

### Endpoint: `/ratings`
*   **Descripción:** Permite a un usuario (conductor o pasajero) enviar una calificación sobre otro usuario después de un viaje completado.
*   **Método HTTP:** `POST`
*   **Formato Serializacion:** JSON
*   **Cabecera entrada:** `Cookie: jwt=...` , `Content-Type: application/json`
*   **Cabecera salida:** `-`

#### Estructura de datos IN:
```json
{
    "tripId": 1,
    "ratedUserId": 2,
    "rating": 5,
    "comment": "Excelente viaje, muy puntual."
}
```

#### Estructura de datos OUT (201 Created):
```json
{
    "success": true,
    "message": "Calificación enviada con éxito"
}
```

#### Estructura de datos ERR (400/403/500):
```json
{
    "error": "Ya has calificado a este usuario para este viaje"
}
```