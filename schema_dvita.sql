CREATE DATABASE IF NOT EXISTS DVita;
USE DVita;

-- ============================================================
-- CREACION DE TABLAS
-- ============================================================

-- 1) TIPO HABITACION
CREATE TABLE IF NOT EXISTS tipo_habitacion (
    id_tipo_habitacion BIGINT       NOT NULL AUTO_INCREMENT,
    descripcion        VARCHAR(255) NOT NULL,
    precio             DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id_tipo_habitacion)
);

-- 2) EMPLEADO
CREATE TABLE IF NOT EXISTS empleado (
    id_empleado BIGINT       NOT NULL AUTO_INCREMENT,
    nombre      VARCHAR(100) NOT NULL,
    apellido_p  VARCHAR(100) NOT NULL,
    apellido_m  VARCHAR(100) NOT NULL,
    dni         VARCHAR(8)   NOT NULL UNIQUE,
    telefono    VARCHAR(15)  NOT NULL,
    activo      TINYINT(1)   NOT NULL DEFAULT 1,
    PRIMARY KEY (id_empleado)
);

-- 3) CLIENTE
CREATE TABLE IF NOT EXISTS cliente (
    id_cliente        BIGINT       NOT NULL AUTO_INCREMENT,
    nombre            VARCHAR(100) NOT NULL,
    apellido_paterno  VARCHAR(100) NOT NULL,
    apellido_materno  VARCHAR(100) NOT NULL,
    dni               VARCHAR(8)   NOT NULL UNIQUE,
    telefono          VARCHAR(15)  NOT NULL,
    email             VARCHAR(150),
    PRIMARY KEY (id_cliente)
);

-- 4) USUARIO
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario     BIGINT      NOT NULL AUTO_INCREMENT,
    id_empleado    BIGINT      NOT NULL UNIQUE,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena     VARCHAR(255) NOT NULL,
    activo         TINYINT(1)  NOT NULL DEFAULT 1,
    PRIMARY KEY (id_usuario),
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
);

-- 5) HABITACION
CREATE TABLE IF NOT EXISTS habitacion (
    id_habitacion      BIGINT      NOT NULL AUTO_INCREMENT,
    id_tipo_habitacion BIGINT      NOT NULL,
    numero_habitacion  INT         NOT NULL UNIQUE,
    estado             VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE',
    PRIMARY KEY (id_habitacion),
    FOREIGN KEY (id_tipo_habitacion) REFERENCES tipo_habitacion(id_tipo_habitacion)
);

-- 6) MODULO PERMISO
CREATE TABLE IF NOT EXISTS modulo_permiso (
    id_modulo_permiso BIGINT      NOT NULL AUTO_INCREMENT,
    id_usuario        BIGINT      NOT NULL,
    modulo            VARCHAR(30) NOT NULL,
    puede_acceder     TINYINT(1)  NOT NULL DEFAULT 1,
    PRIMARY KEY (id_modulo_permiso),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- 7) RECEPCIONISTA
CREATE TABLE IF NOT EXISTS recepcionista (
    id_recepcionista BIGINT      NOT NULL AUTO_INCREMENT,
    id_empleado      BIGINT      NOT NULL UNIQUE,
    turno_trabajo    VARCHAR(20) NOT NULL,
    PRIMARY KEY (id_recepcionista),
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
);

-- 8) ADMINISTRADOR
CREATE TABLE IF NOT EXISTS administrador (
    id_administrador   BIGINT       NOT NULL AUTO_INCREMENT,
    id_empleado        BIGINT       NOT NULL UNIQUE,
    correo_electronico VARCHAR(150) NOT NULL UNIQUE,
    PRIMARY KEY (id_administrador),
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
);

-- 9) HORARIO
CREATE TABLE IF NOT EXISTS horario (
    id_horario      BIGINT      NOT NULL AUTO_INCREMENT,
    id_recepcionista BIGINT     NOT NULL,
    fecha           DATE        NOT NULL,
    hora_inicio     TIME        NOT NULL,
    hora_fin        TIME        NOT NULL,
    tipo_turno      VARCHAR(15) NOT NULL,
    estado          VARCHAR(15) NOT NULL,
    observaciones   VARCHAR(300),
    PRIMARY KEY (id_horario),
    FOREIGN KEY (id_recepcionista) REFERENCES recepcionista(id_recepcionista)
);

-- 10) RESERVA
CREATE TABLE IF NOT EXISTS reserva (
    id_reserva      BIGINT      NOT NULL AUTO_INCREMENT,
    id_cliente      BIGINT      NOT NULL,
    id_habitacion   BIGINT      NOT NULL,
    id_empleado     BIGINT,
    fecha_reserva   DATE        NOT NULL,
    fecha_ingreso   DATE        NOT NULL,
    fecha_salida    DATE        NOT NULL,
    estado_reserva  VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    PRIMARY KEY (id_reserva),
    FOREIGN KEY (id_cliente)    REFERENCES cliente(id_cliente),
    FOREIGN KEY (id_habitacion) REFERENCES habitacion(id_habitacion),
    FOREIGN KEY (id_empleado)   REFERENCES empleado(id_empleado)
);

-- 11) PAGO
CREATE TABLE IF NOT EXISTS pago (
    id_pago      BIGINT      NOT NULL AUTO_INCREMENT,
    id_reserva   BIGINT      NOT NULL UNIQUE,
    monto        DECIMAL(10,2) NOT NULL,
    fecha_pago   DATE        NOT NULL,
    metodo_pago  VARCHAR(30) NOT NULL,
    PRIMARY KEY (id_pago),
    FOREIGN KEY (id_reserva) REFERENCES reserva(id_reserva)
);

-- 12) INCIDENCIA
CREATE TABLE IF NOT EXISTS incidencia (
    id_incidencia        BIGINT      NOT NULL AUTO_INCREMENT,
    id_empleado_registra BIGINT      NOT NULL,
    id_cliente           BIGINT,
    id_habitacion        BIGINT,
    fecha                DATE        NOT NULL,
    tipo                 VARCHAR(30) NOT NULL,
    descripcion          VARCHAR(500) NOT NULL,
    prioridad            VARCHAR(10) NOT NULL DEFAULT 'MEDIA',
    estado               VARCHAR(20) NOT NULL DEFAULT 'ABIERTO',
    fecha_resolucion     DATE,
    notas_internas       VARCHAR(500),
    PRIMARY KEY (id_incidencia),
    FOREIGN KEY (id_empleado_registra) REFERENCES empleado(id_empleado),
    FOREIGN KEY (id_cliente)           REFERENCES cliente(id_cliente),
    FOREIGN KEY (id_habitacion)        REFERENCES habitacion(id_habitacion)
);

-- 13) CHAT SESSION (para chatbot)
CREATE TABLE IF NOT EXISTS chat_session (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    session_id     VARCHAR(255) UNIQUE,
    usuario        VARCHAR(255),
    paso           VARCHAR(255),
    dni            VARCHAR(255),
    fecha_ingreso  VARCHAR(255),
    fecha_salida   VARCHAR(255),
    habitacion_id  BIGINT,
    actualizado_en DATETIME,
    PRIMARY KEY (id)
);
