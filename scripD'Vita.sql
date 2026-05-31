-- ═══════════════════════════════════════════════════
-- LLENADO INICIAL — DVita
-- RAMA FEATURE/MANTENIMIENTO
-- ═══════════════════════════════════════════════════

-- 1) Tipo Habitación
INSERT INTO tipo_habitacion (descripcion, precio) VALUES
('INDIVIDUAL PREMIUM - CAMA SENCILLA, WIFI',       65.00),
('DOBLE PREMIUM - 2 CAMAS, WIFI',                  90.50),
('MATRIMONIAL DELUXE - CAMA KING',                110.00),
('SUITE EJECUTIVA PLUS - JACUZZI Y MINIBAR',      220.00),
('FAMILIAR VIP - HASTA 6 PERSONAS',               180.00);

-- 2) Empleado
INSERT INTO empleado (nombre, apellido_p, apellido_m, dni, telefono) VALUES
('MARCELO', 'ALARCON',    'MANAY',    '71433244', '999111111'),
('JAIR',    'OTERO',      'BRENIS',   '71374451', '999111112'),
('OSCAR',   'SANTAMARIA', 'MORALES',  '73381544', '999111113'),
('JUNIOR',  'ZUMAETA',    'GOLAC',    '71374454', '999111114'),
('ANA',     'GONZALES',   'FLORES',   '15975348', '999111115'),
('DIEGO',   'VARGAS',     'RUIZ',     '25814736', '999111116'),
('DVI',     'BOT',        'ASISTENTEIA', '00000000', '111111111');

-- 3) Usuario
INSERT INTO usuario (id_empleado, nombre_usuario, contrasena) VALUES
(1, 'MALARCON_ADMIN',    'ADMIN123'),
(2, 'JOTEROB_ADMIN',     'ADMIN123'),
(3, 'OSANTAMARIA_ADMIN', 'ADMIN123'),
(4, 'JZUMAETA_ADMIN',    'ADMIN123'),
(5, 'AGONZALES_ADMIN',   'ADMIN123'),
(6, 'DVARGAS_ADMIN',     'ADMIN123');

-- 4) Recepcionista
INSERT INTO recepcionista (id_empleado, turno_trabajo) VALUES
(1, 'NOCHE'),
(2, 'MAÑANA'),
(3, 'TARDE'),
(4, 'NOCHE'),
(5, 'MAÑANA'),
(6, 'TARDE');

-- 5) Administrador
INSERT INTO administrador (id_empleado, correo_electronico) VALUES
(1, '[ADMIN1@DVITA.COM](mailto:ADMIN1@DVITA.COM)'),
(2, '[ADMIN2@DVITA.COM](mailto:ADMIN2@DVITA.COM)'),
(3, '[ADMIN3@DVITA.COM](mailto:ADMIN3@DVITA.COM)'),
(4, '[ADMIN4@DVITA.COM](mailto:ADMIN4@DVITA.COM)');

-- 6) Cliente
INSERT INTO cliente (nombre, apellido_paterno, apellido_materno, dni, telefono, email) VALUES
('LUIS',   'CHAFLOQUE', 'AVELLANEDA', '11122233', '955111222', '[LUIS@GMAIL.COM](mailto:LUIS@GMAIL.COM)'),
('MARIA',  'LOPEZ',     'SANCHEZ',    '22233344', '955222333', '[MARIA@GMAIL.COM](mailto:MARIA@GMAIL.COM)'),
('PEDRO',  'QUISPE',    'AYALA',      '33344455', '955333444', '[PEDRO@GMAIL.COM](mailto:PEDRO@GMAIL.COM)'),
('SOFIA',  'REYES',     'GOMEZ',      '44455566', '955444555', '[SOFIA@GMAIL.COM](mailto:SOFIA@GMAIL.COM)'),
('ANDRES', 'DELGADO',   'TORRES',     '55566677', '955555666', '[ANDRES@GMAIL.COM](mailto:ANDRES@GMAIL.COM)'),
('CARLA',  'MARTINEZ',  'SILVA',      '66677788', '955666777', '[CARLA@GMAIL.COM](mailto:CARLA@GMAIL.COM)'),
('JOSE',   'RAMIREZ',   'DIAZ',       '77788899', '955777888', '[JOSE@GMAIL.COM](mailto:JOSE@GMAIL.COM)');

-- 7) Habitación
INSERT INTO habitacion (id_tipo_habitacion, numero_habitacion, estado) VALUES
(1, 101, 'FUERA_DE_SERVICIO'),
(2, 102, 'MANTENIMIENTO'),
(3, 103, 'MANTENIMIENTO'),
(4, 104, 'OCUPADA'),
(5, 105, 'OCUPADA'),
(1, 106, 'FUERA_DE_SERVICIO'),
(2, 107, 'MANTENIMIENTO'),
(3, 108, 'MANTENIMIENTO');

-- 8) Reserva
INSERT INTO reserva (id_cliente, id_empleado, id_habitacion, fecha_reserva, fecha_ingreso, fecha_salida, estado_reserva) VALUES
(1, 1, 2, '2025-11-01', '2025-11-10', '2025-11-12', 'PENDIENTE'),
(2, 2, 1, '2025-11-05', '2025-11-20', '2025-11-22', 'CANCELADA'),
(3, 3, 5, '2025-11-10', '2025-12-01', '2025-12-05', 'PENDIENTE'),
(4, 4, 4, '2025-11-12', '2025-11-25', '2025-11-27', 'CONFIRMADA'),
(5, 5, 3, '2025-11-15', '2025-12-15', '2025-12-20', 'PENDIENTE'),
(6, 1, 8, '2025-11-20', '2025-12-10', '2025-12-12', 'CANCELADA'),
(7, 3, 7, '2025-11-22', '2025-12-20', '2025-12-25', 'CONFIRMADA');

-- 9) Pago
INSERT INTO pago (id_reserva, monto, fecha_pago, metodo_pago) VALUES
(1, 200.00, '2025-11-12', 'YAPE'),
(2, 100.00, '2025-11-20', 'TRANSFERENCIA'),
(3, 150.00, '2025-11-30', 'TARJETA_DEBITO'),
(4, 50.00,  '2025-11-13', 'YAPE'),
(5, 700.00, '2025-11-16', 'TRANSFERENCIA'),
(6, 100.00, '2025-12-10', 'EFECTIVO'),
(7, 180.00, '2025-12-20', 'TARJETA_CREDITO');
