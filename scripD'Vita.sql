create database DVita;
use Dvita;

-- ═══════════════════════════════════════════════════
-- LLENADO TEMPORAL — DVita (corregido según modelos JPA)
-- ═══════════════════════════════════════════════════
-- 1) Tipo_Habitacion
INSERT INTO tipo_habitacion (descripcion, precio) VALUES
('Individual - cama sencilla, baño privado',        50.00),
('Doble - 2 camas, baño privado',                   75.50),
('Matrimonial - cama matrimonial, vista',            85.00),
('Suite Ejecutiva - cama king, sala, minibar',      150.00),
('Familiar - 2 ambientes, hasta 4 personas',        120.00);

-- 2) Empleado  (columnas: apellido_p, apellido_m | teléfono solo dígitos)
INSERT INTO empleado (nombre, apellido_p, apellido_m, dni, telefono) VALUES
('Junior',   'Zuameta',  'Golac',       '71374454', '987654321'),
('Marcelo',  'Alarcon',  'Manay',       '71433244', '987654322'),
('Cristian', 'Huaman',   'Cruz',        '73381544', '987654323'),
('Ana',      'Gonzales', 'Flores',      '15975348', '987654324'),
('Diego',    'Vargas',   'Ruiz',        '25814736', '987654325');

-- 3) Usuario  (columna: contrasena — sin tilde)
INSERT INTO usuario (id_empleado, nombre_usuario, contrasena) VALUES
(1, 'jufer07',   '123456'),
(2, 'polsent',   '123456'),
(3, 'santamaria', '123456'),.
(4, 'agonzales', 'Ana#2025_'),
(5, 'dvargas',   'Diego2025');

-- 4) Recepcionista  (turno_trabajo max 20 chars)
INSERT INTO recepcionista (id_empleado, turno_trabajo) VALUES
(1, 'Mañana'),
(2, 'Tarde'),
(3, 'Noche'),
(4, 'Mañana'),
(5, 'Tarde');

-- 5) Administrador
INSERT INTO administrador (id_empleado, correo_electronico) VALUES
(1, 'jzuameta@hotel.example.com'),
(2, 'malarcon@hotel.example.com'),
(3, 'chuaman@hotel.example.com'),
(4, 'agonzales@hotel.example.com'),
(5, 'dvargas@hotel.example.com');

-- 6) Cliente  (teléfono solo dígitos)
INSERT INTO cliente (nombre, apellido_paterno, apellido_materno, dni, telefono, email) VALUES
('Luis',   'Chafloque', 'Avellaneda', '11122233', '945111222', 'luis.chafloque@outlook.com'),
('Maria',  'Lopez',     'Sanchez',    '22233344', '945222333', 'maria.lopez@outlook.com'),
('Pedro',  'Quispe',    'Ayala',      '33344455', '945333444', 'pedro.quispe@outlook.com'),
('Sofia',  'Reyes',     'Gomez',      '44455566', '945444555', 'sofia.reyes@outlook.com'),
('Andres', 'Delgado',   'Torres',     '55566677', '945555666', 'andres.delgado@outlook.com');

-- 7) Habitacion  (numero_habitacion es INTEGER | estado: DISPONIBLE|OCUPADA|MANTENIMIENTO)
--    Nota: Habitacion no tiene columna precio propia; el precio viene de tipo_habitacion
INSERT INTO habitacion (id_tipo_habitacion, numero_habitacion, estado, precio) VALUES
(1, 101, 'DISPONIBLE',    50.00),
(2, 102, 'OCUPADA',       75.50),
(3, 103, 'MANTENIMIENTO', 85.00),
(4, 104, 'DISPONIBLE',   150.00),
(5, 105, 'DISPONIBLE',   120.00);

-- 8) Reserva  (estado: PENDIENTE|CONFIRMADA|CANCELADA|COMPLETADA)
--    "Finalizada"  → COMPLETADA
--    "En proceso"  → PENDIENTE
--    "Confirmada"  → CONFIRMADA
--    "Cancelada"   → CANCELADA
INSERT INTO reserva (id_cliente, id_empleado, id_habitacion, fecha_reserva, fecha_ingreso, fecha_salida, estado_reserva) VALUES
(1, 1, 2, '2025-11-01', '2025-11-10', '2025-11-12', 'COMPLETADA'),
(2, 2, 1, '2025-11-05', '2025-11-20', '2025-11-22', 'PENDIENTE'),
(3, 3, 5, '2025-11-10', '2025-12-01', '2025-12-05', 'CONFIRMADA'),
(4, 4, 4, '2025-11-12', '2025-11-25', '2025-11-27', 'CANCELADA'),
(5, 5, 3, '2025-11-15', '2025-12-15', '2025-12-20', 'CONFIRMADA');

-- 9) Pago  (metodo_pago: EFECTIVO|TARJETA_CREDITO|TARJETA_DEBITO|TRANSFERENCIA|YAPE|PLIN)
--    monto debe ser >= 0.01  → el pago cancelado se registra con el monto real cobrado (0 → 1.00 simbólico)
INSERT INTO pago (id_reserva, monto, fecha_pago, metodo_pago) VALUES
(1, 151.00, '2025-11-12', 'TARJETA_CREDITO'),
(2,  50.00, '2025-11-20', 'EFECTIVO'),
(3, 120.00, '2025-11-30', 'YAPE'),
(4,   1.00, '2025-11-13', 'EFECTIVO'),
(5, 600.00, '2025-11-16', 'TRANSFERENCIA');
