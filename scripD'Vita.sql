CREATE DATABASE IF NOT EXISTS DVita;
USE DVita;

-- ═══════════════════════════════════════════════════
-- LLENADO INICIAL — DVita
-- ═══════════════════════════════════════════════════

-- 1) Tipo Habitación
INSERT INTO tipo_habitacion (descripcion, precio) VALUES
('Individual - cama sencilla, baño privado',       50.00),
('Doble - 2 camas, baño privado',                  75.50),
('Matrimonial - cama matrimonial, vista',           85.00),
('Suite Ejecutiva - cama king, sala, minibar',     150.00),
('Familiar - 2 ambientes, hasta 4 personas',       120.00);

-- 2) Empleado
INSERT INTO empleado (nombre, apellido_p, apellido_m, dni, telefono) VALUES
('Marcelo', 'Alarcon',    'Manay',    '71433244', '987654321'),
('Jair', 'Otero',      'Brenis',   '71374451', '987654322'),
('Oscar', 'Santamaria', 'Morales',  '73381544', '987654323'),
('Junior', 'Zumaeta',    'Golac',    '71374454', '987654324'),
('Ana', 'Gonzales',   'Flores',   '15975348', '987654325'),
('Diego', 'Vargas',     'Ruiz',     '25814736', '987654326');

-- 3) Usuario
INSERT INTO usuario (id_empleado, nombre_usuario, contrasena) VALUES
(1, 'malarcon',    '123456'),
(2, 'joterob',     '123456'),
(3, 'osantamaria', '123456'),
(4, 'jzumaeta',    '123456'),
(5, 'agonzales',   '123456'),
(6, 'dvargas',     '123456');

-- 4) Recepcionista
INSERT INTO recepcionista (id_empleado, turno_trabajo) VALUES
(1, 'MAÑANA'),
(2, 'TARDE'),
(3, 'NOCHE'),
(4, 'MAÑANA'),
(5, 'TARDE'),
(6, 'NOCHE');

-- 5) Administrador (los 4 miembros del equipo)
INSERT INTO administrador (id_empleado, correo_electronico) VALUES
(1, 'malarcon@dvita.pe'),
(2, 'joterob@dvita.pe'),
(3, 'osantamaria@dvita.pe'),
(4, 'jzumaeta@dvita.pe');

-- 6) Cliente
INSERT INTO cliente (nombre, apellido_paterno, apellido_materno, dni, telefono, email) VALUES
('Luis',   'Chafloque', 'Avellaneda', '11122233', '945111222', 'luis.chafloque@outlook.com'),
('Maria',  'Lopez',     'Sanchez',    '22233344', '945222333', 'maria.lopez@outlook.com'),
('Pedro',  'Quispe',    'Ayala',      '33344455', '945333444', 'pedro.quispe@outlook.com'),
('Sofia',  'Reyes',     'Gomez',      '44455566', '945444555', 'sofia.reyes@outlook.com'),
('Andres', 'Delgado',   'Torres',     '55566677', '945555666', 'andres.delgado@outlook.com');

-- 7) Habitación
INSERT INTO habitacion (id_tipo_habitacion, numero_habitacion, estado, precio) VALUES
(1, 101, 'DISPONIBLE',    50.00),
(2, 102, 'OCUPADA',       75.50),
(3, 103, 'MANTENIMIENTO', 85.00),
(4, 104, 'DISPONIBLE',   150.00),
(5, 105, 'DISPONIBLE',   120.00);

-- 8) Reserva
INSERT INTO reserva (id_cliente, id_empleado, id_habitacion, fecha_reserva, fecha_ingreso, fecha_salida, estado_reserva) VALUES
(1, 1, 2, '2025-11-01', '2025-11-10', '2025-11-12', 'COMPLETADA'),
(2, 2, 1, '2025-11-05', '2025-11-20', '2025-11-22', 'PENDIENTE'),
(3, 3, 5, '2025-11-10', '2025-12-01', '2025-12-05', 'CONFIRMADA'),
(4, 4, 4, '2025-11-12', '2025-11-25', '2025-11-27', 'CANCELADA'),
(5, 5, 3, '2025-11-15', '2025-12-15', '2025-12-20', 'CONFIRMADA');

-- 9) Pago
INSERT INTO pago (id_reserva, monto, fecha_pago, metodo_pago) VALUES
(1, 151.00, '2025-11-12', 'TARJETA_CREDITO'),
(2,  50.00, '2025-11-20', 'EFECTIVO'),
(3, 120.00, '2025-11-30', 'YAPE'),
(4,   1.00, '2025-11-13', 'EFECTIVO'),
(5, 600.00, '2025-11-16', 'TRANSFERENCIA');