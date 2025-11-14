CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE
);

INSERT INTO `roles` (`name`) VALUES ('conductor'), ('pasajero');

CREATE TABLE user_roles (
    user_id INT,
    role_id INT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE conductores (
    id INT PRIMARY KEY,
    licencia VARCHAR(255) NOT NULL UNIQUE,
    patente VARCHAR(255) NOT NULL UNIQUE,
    vehiculo VARCHAR(255),
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE pasajeros (
    id INT PRIMARY KEY,
    telefono VARCHAR(255),
    direccion VARCHAR(255),
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE viajes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conductor_id INT,
    origen VARCHAR(255),
    destino VARCHAR(255),
    origen_lat DECIMAL(10, 8),
    origen_lng DECIMAL(11, 8),
    destino_lat DECIMAL(10, 8),
    destino_lng DECIMAL(11, 8),
    waypoints JSON,
    fecha_salida DATETIME,
    asientos_disponibles INT,
    precio DECIMAL(10, 2),
    estado VARCHAR(50),
    FOREIGN KEY (conductor_id) REFERENCES conductores(id)
);

CREATE TABLE solicitudes_viaje (
    id INT PRIMARY KEY AUTO_INCREMENT,
    viaje_id INT,
    pasajero_id INT,
    asientos_solicitados INT DEFAULT 1,
    estado VARCHAR(50) DEFAULT 'pendiente',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (viaje_id) REFERENCES viajes(id) ON DELETE CASCADE,
    FOREIGN KEY (pasajero_id) REFERENCES pasajeros(id) ON DELETE CASCADE
);

CREATE TABLE ratings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    viaje_id INT,
    calificador_id INT,
    calificado_id INT,
    calificacion INT,
    comentario TEXT,
    UNIQUE KEY uq_rating (viaje_id, calificador_id, calificado_id),
    FOREIGN KEY (viaje_id) REFERENCES viajes(id) ON DELETE SET NULL,
    FOREIGN KEY (calificador_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (calificado_id) REFERENCES users(id) ON DELETE CASCADE
);
