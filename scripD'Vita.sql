CREATE DATABASE IF NOT EXISTS DVita;
USE DVita;

-- 1) Tipo Habitacion
INSERT INTO tipo_habitacion (descripcion, precio) VALUES
('INDIVIDUAL - CAMA SENCILLA, BAÑO PRIVADO', 60.00),
('DOBLE - 2 CAMAS, BAÑO PRIVADO', 82.00),
('MATRIMONIAL - CAMA MATRIMONIAL, VISTA AL MAR', 95.00),
('SUITE EJECUTIVA - CAMA KING, SALA, MINIBAR', 200.00),
('FAMILIAR - 2 AMBIENTES, HASTA 4 PERSONAS', 140.00);

-- 2) Empleado
INSERT INTO empleado (nombre, apellido_p, apellido_m, dni, telefono) VALUES
('MARCELO', 'ALARCON', 'MANAY', '71433244', '999000001'),
('JAIR', 'OTERO', 'BRENIS', '71374451', '999000002'),
('OSCAR', 'SANTAMARIA', 'MORALES', '73381544', '999000003'),
('JUNIOR', 'ZUMAETA', 'GOLAC', '71374454', '999000004'),
('ANA', 'GONZALES', 'FLORES', '15975348', '999000005'),
('DIEGO', 'VARGAS', 'RUIZ', '25814736', '999000006'),
('DVI', 'BOT', 'CHATBOTVIRTUAL', '00000000', '999000007');

-- 3) Usuario
INSERT INTO usuario (id_empleado, nombre_usuario, contrasena) VALUES
(1, 'MALARCON', 'pass_2025_01'),
(2, 'JOTEROB', 'pass_2025_02'),
(3, 'OSANTAMARIA', 'pass_2025_03'),
(4, 'JZUMAETA', 'pass_2025_04'),
(5, 'AGONZALES', 'pass_2025_05'),
(6, 'DVARGAS', 'pass_2025_06');

-- 4) Recepcionista
INSERT INTO recepcionista (id_empleado, turno_trabajo) VALUES
(1, 'MAÑANA'),
(2, 'TARDE'),
(3, 'NOCHE'),
(4, 'MAÑANA'),
(5, 'TARDE'),
(6, 'NOCHE');

-- 5) Administrador
INSERT INTO administrador (id_empleado, correo_electronico) VALUES
(1, 'MALARCON@DVITA.COM'),
(2, 'JOTEROB@DVITA.COM'),
(3, 'OSANTAMARIA@DVITA.COM'),
(4, 'JZUMAETA@DVITA.COM');

-- 6) Cliente
INSERT INTO cliente (nombre, apellido_paterno, apellido_materno, dni, telefono, email) VALUES
('LUIS', 'CHAFLOQUE', 'AVELLANEDA', '11122233', '945111222', 'LUIS.CHAFLOQUE@OUTLOOK.COM'),
('MARIA', 'LOPEZ', 'SANCHEZ', '22233344', '945222333', 'MARIA.LOPEZ@OUTLOOK.COM'),
('PEDRO', 'QUISPE', 'AYALA', '33344455', '945333444', 'PEDRO.QUISPE@OUTLOOK.COM'),
('SOFIA', 'REYES', 'GOMEZ', '44455566', '945444555', 'SOFIA.REYES@OUTLOOK.COM'),
('ANDRES', 'DELGADO', 'TORRES', '55566677', '945555666', 'ANDRES.DELGADO@OUTLOOK.COM');

-- 7) Habitacion
INSERT INTO habitacion (id_tipo_habitacion, numero_habitacion, estado) VALUES
(1, 101, 'DISPONIBLE'),
(2, 102, 'OCUPADA'),
(3, 103, 'DISPONIBLE'),
(4, 104, 'DISPONIBLE'),
(5, 105, 'DISPONIBLE');

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
(2, 50.00, '2025-11-20', 'TRANSFERENCIA'),
(3, 120.00, '2025-11-30', 'YAPE'),
(4, 1.00, '2025-11-13', 'EFECTIVO'),
(5, 600.00, '2025-11-16', 'TRANSFERENCIA');