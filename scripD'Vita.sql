-- ============================================================
-- 1) TIPO HABITACION (4)
-- ============================================================
INSERT INTO tipo_habitacion (descripcion, precio) VALUES
('INDIVIDUAL - CAMA SENCILLA, BAÑO PRIVADO', 55.00),
('DOBLE - 2 CAMAS INDIVIDUALES, BAÑO COMPLETO', 82.00),
('MATRIMONIAL - CAMA QUEEN, TV LED', 88.00),
('SUITE - CAMA KING, SALA, MINIBAR', 200.00);

-- ============================================================
-- 2) EMPLEADO (15)
-- ============================================================
INSERT INTO empleado (nombre, apellido_p, apellido_m, dni, telefono, activo) VALUES
('MARCELO', 'ALARCON', 'MANAY', '71433244', '999000001', 1),
('JAIR', 'OTERO', 'BRENIS', '71374451', '999000002', 1),
('OSCAR', 'SANTAMARIA', 'MORALES', '73381544', '999000003', 1),
('JUNIOR', 'ZUMAETA', 'GOLAC', '71374454', '999000004', 1),
('ANA', 'GONZALES', 'FLORES', '15975348', '999000005', 1),
('DIEGO', 'VARGAS', 'RUIZ', '25814736', '999000006', 1),
('DVI', 'BOT', 'CHATBOTVIRTUAL', '00000000', '999000007', 1),
('MARIA', 'RODRIGUEZ', 'LOPEZ', '12345678', '999000008', 1),
('JUAN', 'MARTINEZ', 'SILVA', '23456789', '999000009', 1),
('CARMEN', 'FERNANDEZ', 'TORRES', '34567890', '999000010', 1),
('PEDRO', 'RAMIREZ', 'PAREDES', '45678901', '999000011', 1),
('ELENA', 'SANCHEZ', 'CASTRO', '56789012', '999000012', 1),
('LUIS', 'GARCIA', 'MENDOZA', '67890123', '999000013', 1),
('SOFIA', 'HERRERA', 'DELGADO', '78901234', '999000014', 1),
('ANDRES', 'VEGA', 'CAMPOS', '89012345', '999000015', 1);

-- ============================================================
-- 3) USUARIO (15, pass: 123456)
-- ============================================================
INSERT INTO usuario (id_empleado, nombre_usuario, contrasena, activo) VALUES
(1, 'malarcon', '123456', 1),
(2, 'jotero', '123456', 1),
(3, 'osantamaria', '123456', 1),
(4, 'jzumaeta', '123456', 1),
(5, 'agonzales', '123456', 1),
(6, 'dvargas', '123456', 1),
(7, 'dbot', '123456', 1),
(8, 'mrodriguez', '123456', 1),
(9, 'jmartinez', '123456', 1),
(10, 'cfernandez', '123456', 1),
(11, 'pramirez', '123456', 1),
(12, 'esanchez', '123456', 1),
(13, 'lgarcia', '123456', 1),
(14, 'sherrera', '123456', 1),
(15, 'avega', '123456', 1);

-- ============================================================
-- 4) CLIENTE (15)
-- ============================================================
INSERT INTO cliente (nombre, apellido_paterno, apellido_materno, dni, telefono, email) VALUES
('CARLOS', 'MARTINEZ', 'LOPEZ', '11122233', '945111001', 'carlos.martinez@outlook.com'),
('MARIA', 'LOPEZ', 'SANCHEZ', '22233344', '945111002', 'maria.lopez@outlook.com'),
('PEDRO', 'QUISPE', 'AYALA', '33344455', '945111003', 'pedro.quispe@outlook.com'),
('SOFIA', 'REYES', 'GOMEZ', '44455566', '945111004', 'sofia.reyes@outlook.com'),
('ANDRES', 'DELGADO', 'TORRES', '55566677', '945111005', 'andres.delgado@outlook.com'),
('CARMEN', 'HUAMAN', 'PEREZ', '66677788', '945111006', 'carmen.huaman@outlook.com'),
('JOSE', 'RAMIREZ', 'CAMPOS', '77788899', '945111007', 'jose.ramirez@outlook.com'),
('ROSA', 'CASTILLO', 'VEGA', '88899900', '945111008', 'rosa.castillo@outlook.com'),
('CARLOS', 'MORALES', 'PAREDES', '99900011', '945111009', 'carlos.morales@outlook.com'),
('LUCIA', 'TORRES', 'GUZMAN', '10020033', '945111010', 'lucia.torres@outlook.com'),
('MANUEL', 'SALAZAR', 'ORTEGA', '10120233', '945111011', 'manuel.salazar@outlook.com'),
('PATRICIA', 'FLORES', 'ROMERO', '10220333', '945111012', 'patricia.flores@outlook.com'),
('RICARDO', 'MENDOZA', 'NAVARRO', '10320433', '945111013', 'ricardo.mendoza@outlook.com'),
('LAURA', 'AGUILAR', 'BUSTOS', '10420533', '945111014', 'laura.aguilar@outlook.com'),
('FERNANDO', 'CACERES', 'LINARES', '10520633', '945111015', 'fernando.caceres@outlook.com');

-- ============================================================
-- 5) HABITACION (20) — 5 por cada tipo
-- ============================================================
INSERT INTO habitacion (id_tipo_habitacion, numero_habitacion, estado) VALUES
(1, 101, 'DISPONIBLE'),    (1, 102, 'OCUPADA'),
(1, 103, 'DISPONIBLE'),    (1, 104, 'DISPONIBLE'),
(1, 105, 'OCUPADA'),       (2, 106, 'EN_LIMPIEZA'),
(2, 107, 'DISPONIBLE'),    (2, 108, 'DISPONIBLE'),
(2, 109, 'MANTENIMIENTO'), (2, 110, 'DISPONIBLE'),
(3, 201, 'OCUPADA'),       (3, 202, 'DISPONIBLE'),
(3, 203, 'DISPONIBLE'),    (3, 204, 'DISPONIBLE'),
(3, 205, 'DISPONIBLE'),    (4, 206, 'EN_LIMPIEZA'),
(4, 207, 'OCUPADA'),       (4, 208, 'DISPONIBLE'),
(4, 209, 'MANTENIMIENTO'), (4, 210, 'DISPONIBLE');

-- ============================================================
-- 6) AREA (7)
-- ============================================================
INSERT INTO area (nombre, prioridad_base, nivel_prioridad, descripcion, activo) VALUES
('RESERVAS',       'URGENTE', 4, 'Área de reservas y atención al cliente', true),
('RECEPCION',      'ALTA',    3, 'Recepción y front desk', true),
('MANTENIMIENTO',  'MEDIA',   2, 'Mantenimiento de habitaciones e instalaciones', true),
('LIMPIEZA',       'MEDIA',   2, 'Housekeeping y limpieza', true),
('SEGURIDAD',      'MEDIA',   2, 'Seguridad del hotel', true),
('ADMINISTRACION', 'BAJA',    1, 'Administración y gerencia', true),
('OTRO',           'MEDIA',   2, 'Otras áreas no especificadas', true);

-- ============================================================
-- 7) MODULO PERMISO (15 usuarios × 8 módulos = 120)
-- ============================================================
INSERT INTO modulo_permiso (id_usuario, modulo, puede_acceder) VALUES
(1, 'CLIENTES',true),(1, 'EMPLEADOS',true),(1, 'HABITACIONES',true),(1, 'TIPOS_HABITACION',true),(1, 'RESERVAS',true),(1, 'PAGOS',true),(1, 'USUARIOS',true),(1, 'INCIDENCIAS',true),
(2, 'CLIENTES',true),(2, 'EMPLEADOS',true),(2, 'HABITACIONES',true),(2, 'TIPOS_HABITACION',true),(2, 'RESERVAS',true),(2, 'PAGOS',true),(2, 'USUARIOS',true),(2, 'INCIDENCIAS',true),
(3, 'CLIENTES',true),(3, 'EMPLEADOS',true),(3, 'HABITACIONES',true),(3, 'TIPOS_HABITACION',true),(3, 'RESERVAS',true),(3, 'PAGOS',true),(3, 'USUARIOS',true),(3, 'INCIDENCIAS',true),
(4, 'CLIENTES',true),(4, 'EMPLEADOS',true),(4, 'HABITACIONES',true),(4, 'TIPOS_HABITACION',true),(4, 'RESERVAS',true),(4, 'PAGOS',true),(4, 'USUARIOS',true),(4, 'INCIDENCIAS',true),
(5, 'CLIENTES',true),(5, 'EMPLEADOS',true),(5, 'HABITACIONES',true),(5, 'TIPOS_HABITACION',true),(5, 'RESERVAS',true),(5, 'PAGOS',true),(5, 'USUARIOS',true),(5, 'INCIDENCIAS',true),
(6, 'CLIENTES',true),(6, 'EMPLEADOS',true),(6, 'HABITACIONES',true),(6, 'TIPOS_HABITACION',true),(6, 'RESERVAS',true),(6, 'PAGOS',true),(6, 'USUARIOS',true),(6, 'INCIDENCIAS',true),
(7, 'CLIENTES',true),(7, 'EMPLEADOS',true),(7, 'HABITACIONES',true),(7, 'TIPOS_HABITACION',true),(7, 'RESERVAS',true),(7, 'PAGOS',true),(7, 'USUARIOS',true),(7, 'INCIDENCIAS',true),
(8, 'CLIENTES',true),(8, 'EMPLEADOS',true),(8, 'HABITACIONES',true),(8, 'TIPOS_HABITACION',true),(8, 'RESERVAS',true),(8, 'PAGOS',true),(8, 'USUARIOS',true),(8, 'INCIDENCIAS',true),
(9, 'CLIENTES',true),(9, 'EMPLEADOS',true),(9, 'HABITACIONES',true),(9, 'TIPOS_HABITACION',true),(9, 'RESERVAS',true),(9, 'PAGOS',true),(9, 'USUARIOS',true),(9, 'INCIDENCIAS',true),
(10,'CLIENTES',true),(10,'EMPLEADOS',true),(10,'HABITACIONES',true),(10,'TIPOS_HABITACION',true),(10,'RESERVAS',true),(10,'PAGOS',true),(10,'USUARIOS',true),(10,'INCIDENCIAS',true),
(11,'CLIENTES',true),(11,'EMPLEADOS',true),(11,'HABITACIONES',true),(11,'TIPOS_HABITACION',true),(11,'RESERVAS',true),(11,'PAGOS',true),(11,'USUARIOS',true),(11,'INCIDENCIAS',true),
(12,'CLIENTES',true),(12,'EMPLEADOS',true),(12,'HABITACIONES',true),(12,'TIPOS_HABITACION',true),(12,'RESERVAS',true),(12,'PAGOS',true),(12,'USUARIOS',true),(12,'INCIDENCIAS',true),
(13,'CLIENTES',true),(13,'EMPLEADOS',true),(13,'HABITACIONES',true),(13,'TIPOS_HABITACION',true),(13,'RESERVAS',true),(13,'PAGOS',true),(13,'USUARIOS',true),(13,'INCIDENCIAS',true),
(14,'CLIENTES',true),(14,'EMPLEADOS',true),(14,'HABITACIONES',true),(14,'TIPOS_HABITACION',true),(14,'RESERVAS',true),(14,'PAGOS',true),(14,'USUARIOS',true),(14,'INCIDENCIAS',true),
(15,'CLIENTES',true),(15,'EMPLEADOS',true),(15,'HABITACIONES',true),(15,'TIPOS_HABITACION',true),(15,'RESERVAS',true),(15,'PAGOS',true),(15,'USUARIOS',true),(15,'INCIDENCIAS',true);

-- ============================================================
-- 8) RESERVA (20)
-- ============================================================
INSERT INTO reserva (id_cliente, id_empleado, id_habitacion, fecha_reserva, fecha_ingreso, fecha_salida, estado_reserva) VALUES
(1,  1,  6, '2025-01-10', '2025-01-15', '2025-01-18', 'COMPLETADA'),
(2,  2,  5, '2025-01-20', '2025-01-25', '2025-01-27', 'COMPLETADA'),
(3,  3,  3, '2025-02-05', '2025-02-10', '2025-02-14', 'COMPLETADA'),
(4,  4,  1, '2025-02-15', '2025-02-20', '2025-02-22', 'COMPLETADA'),
(5,  5,  2, '2025-03-01', '2025-03-05', '2025-03-08', 'COMPLETADA'),
(6,  6,  4, '2025-03-10', '2025-03-14', '2025-03-16', 'COMPLETADA'),
(7,  8,  7, '2025-03-20', '2025-03-26', '2025-03-29', 'COMPLETADA'),
(8,  9,  8, '2025-04-01', '2025-04-05', '2025-04-07', 'COMPLETADA'),
(9, 10,  9, '2025-04-10', '2025-04-15', '2025-04-18', 'CANCELADA'),
(10,11, 10, '2025-04-20', '2025-04-25', '2025-04-28', 'COMPLETADA'),
(11,12, 11, '2025-05-02', '2025-05-06', '2025-05-10', 'COMPLETADA'),
(12,13, 12, '2025-05-12', '2025-05-16', '2025-05-19', 'COMPLETADA'),
(13,14, 13, '2025-05-22', '2025-05-28', '2025-05-30', 'CANCELADA'),
(14,15, 14, '2025-06-05', '2025-06-10', '2025-06-13', 'COMPLETADA'),
(15, 1, 15, '2025-06-15', '2025-06-20', '2025-06-23', 'COMPLETADA'),
(6,  2, 16, '2025-07-01', '2025-07-05', '2025-07-08', 'COMPLETADA'),
(7,  3, 17, '2025-07-12', '2025-07-18', '2025-07-21', 'COMPLETADA'),
(8,  4, 18, '2025-08-01', '2025-08-05', '2025-08-08', 'COMPLETADA'),
(9,  5, 19, '2025-08-10', '2025-08-15', '2025-08-18', 'CANCELADA'),
(10, 6, 20, '2025-08-20', '2025-08-25', '2025-08-28', 'COMPLETADA');

-- ============================================================
-- 9) PAGO (20)
-- ============================================================
INSERT INTO pago (id_reserva, monto, fecha_pago, metodo_pago) VALUES
(1,  200.00, '2025-01-15', 'TARJETA_CREDITO'),
(2,  147.00, '2025-01-25', 'EFECTIVO'),
(3,  276.00, '2025-02-10', 'TRANSFERENCIA'),
(4,  95.00,  '2025-02-20', 'YAPE'),
(5,  246.00, '2025-03-05', 'TARJETA_DEBITO'),
(6,  160.00, '2025-03-14', 'EFECTIVO'),
(7,  265.00, '2025-03-26', 'TRANSFERENCIA'),
(8,  180.00, '2025-04-05', 'YAPE'),
(9,  50.00,  '2025-04-15', 'PLIN'),
(10, 140.00, '2025-04-25', 'TARJETA_CREDITO'),
(11, 400.00, '2025-05-06', 'TRANSFERENCIA'),
(12, 360.00, '2025-05-16', 'YAPE'),
(13, 80.00,  '2025-05-28', 'EFECTIVO'),
(14, 260.00, '2025-06-10', 'TARJETA_DEBITO'),
(15, 750.00, '2025-06-20', 'TRANSFERENCIA'),
(16, 350.00, '2025-07-05', 'TARJETA_CREDITO'),
(17, 450.00, '2025-07-18', 'YAPE'),
(18, 240.00, '2025-08-05', 'PLIN'),
(19, 100.00, '2025-08-15', 'EFECTIVO'),
(20, 410.00, '2025-08-25', 'TRANSFERENCIA');

-- ============================================================
-- 10) INCIDENCIA (20)
--     id_area: 1=RESERVAS, 2=RECEPCION, 3=MANTENIMIENTO,
--              4=LIMPIEZA, 5=SEGURIDAD, 6=ADMINISTRACION, 7=OTRO
-- ============================================================
INSERT INTO incidencia (id_empleado_registra, id_cliente, id_habitacion, id_area, fecha, tipo, descripcion, prioridad, estado, fecha_resolucion, notas_internas, es_recurrente, veces_resuelta) VALUES
(1,  1,  6,  3, '2025-01-16', 'DAÑO_HABITACION',     'Aire acondicionado no enfría en habitación 106', 'ALTA', 'RESUELTO', '2025-01-17', 'Reparado el 17/01', false, 1),
(3,  NULL, 3, 3, '2025-02-12', 'FALLA_EQUIPO',        'TV no enciende en habitación 103', 'MEDIA', 'RESUELTO', '2025-02-13', 'Cambiado fusible', false, 1),
(5,  3,  NULL, 2,'2025-03-06', 'QUEJA_HUESPED',       'Huésped del 105 reporta ruido de construcción', 'URGENTE', 'CERRADO', NULL, 'Notificado a construcción', false, 0),
(2,  4,  1,  7, '2025-03-22', 'OTRO',                'Llave magnética no funciona en habitación 101', 'BAJA', 'CERRADO', NULL, 'Reprogramada tarjeta', false, 0),
(6,  5,  6,  3, '2025-04-02', 'DAÑO_HABITACION',     'Ducha sin agua caliente en habitación 106', 'ALTA', 'RESUELTO', '2025-04-03', 'Terma reparada', false, 1),
(8,  NULL, 7, 3, '2025-04-08', 'FALLA_EQUIPO',        'Secador de pelo no funciona en habitación 107', 'BAJA', 'RESUELTO', '2025-04-09', 'Reemplazado', false, 1),
(9,  6,  NULL, 4,'2025-05-07', 'PROBLEMA_SERVICIO',   'Toallas no cambiadas en habitación 201', 'MEDIA', 'CERRADO', NULL, 'Ama de llaves notificada', false, 0),
(10, 7,  8,  2, '2025-05-18', 'QUEJA_HUESPED',       'Ruido de fiesta en habitación contigua', 'URGENTE', 'RESUELTO', '2025-05-19', 'Seguridad intervino', false, 1),
(11, NULL, 9, 3, '2025-06-12', 'DAÑO_HABITACION',     'Cama rota en habitación 109', 'ALTA', 'CERRADO', NULL, 'Cambio de mobiliario', false, 0),
(12, 8,  10, 7, '2025-07-06', 'OTRO',                'Huésped olvidó pertenencias', 'BAJA', 'CERRADO', NULL, 'Entregado en recepción', false, 0),
(13, 9, NULL, 2,'2025-07-20', 'QUEJA_HUESPED',       'Wifi inestable en piso 2', 'MEDIA', 'RESUELTO', '2025-07-21', 'Router reemplazado', false, 1),
(14, 10, 11, 3, '2025-08-03', 'DAÑO_HABITACION',     'Inodoro tapado en habitación 201', 'ALTA', 'RESUELTO', '2025-08-04', 'Destapado con éxito', false, 1),
(15, NULL, 12,3, '2025-08-10', 'FALLA_EQUIPO',        'Microondas no calienta en habitación 202', 'MEDIA', 'CERRADO', NULL, 'Reemplazado', false, 0),
(1,  11, 13, 4, '2025-09-04', 'PROBLEMA_SERVICIO',   'No hubo servicio de limpieza por 2 días', 'MEDIA', 'RESUELTO', '2025-09-05', 'Programación corregida', false, 1),
(3,  12, 14, 2, '2025-09-22', 'QUEJA_HUESPED',       'Personal de mantenimiento entró sin avisar', 'URGENTE', 'CERRADO', NULL, 'Capacitación al personal', false, 0),
(5,  NULL, 15,3, '2025-10-06', 'DAÑO_HABITACION',     'Persiana rota en habitación 205', 'BAJA', 'RESUELTO', '2025-10-07', 'Persiana reemplazada', false, 1),
(6,  13, 16, 7, '2025-10-16', 'OTRO',                'Maleta dañada por personal de hotel', 'ALTA', 'RESUELTO', '2025-10-17', 'Compensación al huésped', false, 1),
(8,  14, 17, 3, '2025-11-03', 'FALLA_EQUIPO',        'Aire acondicionado ruidoso en habitación 207', 'MEDIA', 'CERRADO', NULL, 'Mantenimiento preventivo', false, 0),
(9,  NULL, 18,4, '2025-11-12', 'PROBLEMA_SERVICIO',   'Agua caliente tarda 10 min en salir', 'BAJA', 'RESUELTO', '2025-11-13', 'Válvula ajustada', false, 1),
(10, 15, 19, 3, '2025-11-22', 'DAÑO_HABITACION',     'Lámpara de mesa no prende', 'BAJA', 'RESUELTO', '2025-11-23', 'Bombillo reemplazado', false, 1);

-- ============================================================
-- 11) INCIDENCIA_RESOLUCION — Historial de resoluciones (12)
-- ============================================================
INSERT INTO incidencia_resolucion (id_incidencia, version, fecha_resolucion, solucion, id_empleado_resuelve, notas_auditoria) VALUES
(1,  1, '2025-01-17', 'Resuelto: Reparado el 17/01',          NULL, 'Migrado del sistema anterior'),
(2,  1, '2025-02-13', 'Resuelto: Cambiado fusible',           NULL, 'Migrado del sistema anterior'),
(5,  1, '2025-04-03', 'Resuelto: Terma reparada',             NULL, 'Migrado del sistema anterior'),
(6,  1, '2025-04-09', 'Resuelto: Reemplazado',                NULL, 'Migrado del sistema anterior'),
(8,  1, '2025-05-19', 'Resuelto: Seguridad intervino',        NULL, 'Migrado del sistema anterior'),
(11, 1, '2025-07-21', 'Resuelto: Router reemplazado',         NULL, 'Migrado del sistema anterior'),
(12, 1, '2025-08-04', 'Resuelto: Destapado con éxito',        NULL, 'Migrado del sistema anterior'),
(14, 1, '2025-09-05', 'Resuelto: Programación corregida',     NULL, 'Migrado del sistema anterior'),
(16, 1, '2025-10-07', 'Resuelto: Persiana reemplazada',       NULL, 'Migrado del sistema anterior'),
(17, 1, '2025-10-17', 'Resuelto: Compensación al huésped',    NULL, 'Migrado del sistema anterior'),
(19, 1, '2025-11-13', 'Resuelto: Válvula ajustada',           NULL, 'Migrado del sistema anterior'),
(20, 1, '2025-11-23', 'Resuelto: Bombillo reemplazado',       NULL, 'Migrado del sistema anterior');
