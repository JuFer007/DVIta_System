-- ============================================================
-- 1) TIPO HABITACION (4)
-- ============================================================
INSERT IGNORE INTO tipo_habitacion (id_tipo_habitacion, descripcion, precio) VALUES
(1, 'INDIVIDUAL - CAMA SENCILLA, BAÑO PRIVADO', 55.00),
(2, 'DOBLE - 2 CAMAS INDIVIDUALES, BAÑO COMPLETO', 82.00),
(3, 'MATRIMONIAL - CAMA QUEEN, TV LED', 88.00),
(4, 'SUITE - CAMA KING, SALA, MINIBAR', 200.00);

-- ============================================================
-- 2) EMPLEADO (15)
-- ============================================================
INSERT IGNORE INTO empleado (id_empleado, nombre, apellido_p, apellido_m, dni, telefono, activo) VALUES
(1, 'MARCELO', 'ALARCON', 'MANAY', '71433244', '999000001', 1),
(2, 'JAIR', 'OTERO', 'BRENIS', '71374451', '999000002', 1),
(3, 'OSCAR', 'SANTAMARIA', 'MORALES', '73381544', '999000003', 1),
(4, 'JUNIOR', 'ZUMAETA', 'GOLAC', '71374454', '999000004', 1),
(5, 'ANA', 'GONZALES', 'FLORES', '15975348', '999000005', 1),
(6, 'DIEGO', 'VARGAS', 'RUIZ', '25814736', '999000006', 1),
(7, 'DVI', 'BOT', 'CHATBOTVIRTUAL', '00000000', '999000007', 1),
(8, 'MARIA', 'RODRIGUEZ', 'LOPEZ', '12345678', '999000008', 1),
(9, 'JUAN', 'MARTINEZ', 'SILVA', '23456789', '999000009', 1),
(10, 'CARMEN', 'FERNANDEZ', 'TORRES', '34567890', '999000010', 1),
(11, 'PEDRO', 'RAMIREZ', 'PAREDES', '45678901', '999000011', 1),
(12, 'ELENA', 'SANCHEZ', 'CASTRO', '56789012', '999000012', 1),
(13, 'LUIS', 'GARCIA', 'MENDOZA', '67890123', '999000013', 1),
(14, 'SOFIA', 'HERRERA', 'DELGADO', '78901234', '999000014', 1),
(15, 'ANDRES', 'VEGA', 'CAMPOS', '89012345', '999000015', 1);

-- ============================================================
-- 3) USUARIO (15, pass: 123456)
-- ============================================================
INSERT IGNORE INTO usuario (id_usuario, id_empleado, nombre_usuario, contrasena, activo) VALUES
(1, 1, 'malarcon', '123456', 1),
(2, 2, 'jotero', '123456', 1),
(3, 3, 'osantamaria', '123456', 1),
(4, 4, 'jzumaeta', '123456', 1),
(5, 5, 'agonzales', '123456', 1),
(6, 6, 'dvargas', '123456', 1),
(7, 7, 'dbot', '123456', 1),
(8, 8, 'mrodriguez', '123456', 1),
(9, 9, 'jmartinez', '123456', 1),
(10, 10, 'cfernandez', '123456', 1),
(11, 11, 'pramirez', '123456', 1),
(12, 12, 'esanchez', '123456', 1),
(13, 13, 'lgarcia', '123456', 1),
(14, 14, 'sherrera', '123456', 1),
(15, 15, 'avega', '123456', 1);

-- ============================================================
-- 4) CLIENTE (15)
-- ============================================================
INSERT IGNORE INTO cliente (id_cliente, nombre, apellido_paterno, apellido_materno, dni, telefono, email) VALUES
(1, 'CARLOS', 'MARTINEZ', 'LOPEZ', '11122233', '945111001', 'carlos.martinez@outlook.com'),
(2, 'MARIA', 'LOPEZ', 'SANCHEZ', '22233344', '945111002', 'maria.lopez@outlook.com'),
(3, 'PEDRO', 'QUISPE', 'AYALA', '33344455', '945111003', 'pedro.quispe@outlook.com'),
(4, 'SOFIA', 'REYES', 'GOMEZ', '44455566', '945111004', 'sofia.reyes@outlook.com'),
(5, 'ANDRES', 'DELGADO', 'TORRES', '55566677', '945111005', 'andres.delgado@outlook.com'),
(6, 'CARMEN', 'HUAMAN', 'PEREZ', '66677788', '945111006', 'carmen.huaman@outlook.com'),
(7, 'JOSE', 'RAMIREZ', 'CAMPOS', '77788899', '945111007', 'jose.ramirez@outlook.com'),
(8, 'ROSA', 'CASTILLO', 'VEGA', '88899900', '945111008', 'rosa.castillo@outlook.com'),
(9, 'CARLOS', 'MORALES', 'PAREDES', '99900011', '945111009', 'carlos.morales@outlook.com'),
(10, 'LUCIA', 'TORRES', 'GUZMAN', '10020033', '945111010', 'lucia.torres@outlook.com'),
(11, 'MANUEL', 'SALAZAR', 'ORTEGA', '10120233', '945111011', 'manuel.salazar@outlook.com'),
(12, 'PATRICIA', 'FLORES', 'ROMERO', '10220333', '945111012', 'patricia.flores@outlook.com'),
(13, 'RICARDO', 'MENDOZA', 'NAVARRO', '10320433', '945111013', 'ricardo.mendoza@outlook.com'),
(14, 'LAURA', 'AGUILAR', 'BUSTOS', '10420533', '945111014', 'laura.aguilar@outlook.com'),
(15, 'FERNANDO', 'CACERES', 'LINARES', '10520633', '945111015', 'fernando.caceres@outlook.com');

-- ============================================================
-- 5) HABITACION (20) — 5 por cada tipo
-- ============================================================
INSERT IGNORE INTO habitacion (id_habitacion, id_tipo_habitacion, numero_habitacion, estado) VALUES
(1, 1, 101, 'DISPONIBLE'),    (2, 1, 102, 'OCUPADA'),
(3, 1, 103, 'DISPONIBLE'),    (4, 1, 104, 'DISPONIBLE'),
(5, 1, 105, 'OCUPADA'),       (6, 2, 106, 'EN_LIMPIEZA'),
(7, 2, 107, 'DISPONIBLE'),    (8, 2, 108, 'DISPONIBLE'),
(9, 2, 109, 'MANTENIMIENTO'), (10, 2, 110, 'DISPONIBLE'),
(11, 3, 201, 'OCUPADA'),      (12, 3, 202, 'DISPONIBLE'),
(13, 3, 203, 'DISPONIBLE'),   (14, 3, 204, 'DISPONIBLE'),
(15, 3, 205, 'DISPONIBLE'),   (16, 4, 206, 'EN_LIMPIEZA'),
(17, 4, 207, 'OCUPADA'),      (18, 4, 208, 'DISPONIBLE'),
(19, 4, 209, 'MANTENIMIENTO'),(20, 4, 210, 'DISPONIBLE');

-- ============================================================
-- 6) AREA (7)
-- ============================================================
INSERT IGNORE INTO area (id_area, nombre, prioridad_base, nivel_prioridad, descripcion, activo) VALUES
(1, 'RESERVAS', 'URGENTE', 4, 'Área de reservas y atención al cliente', 1),
(2, 'RECEPCION', 'ALTA', 3, 'Recepción y front desk', 1),
(3, 'MANTENIMIENTO', 'MEDIA', 2, 'Mantenimiento de habitaciones e instalaciones', 1),
(4, 'LIMPIEZA', 'MEDIA', 2, 'Housekeeping y limpieza', 1),
(5, 'SEGURIDAD', 'MEDIA', 2, 'Seguridad del hotel', 1),
(6, 'ADMINISTRACION', 'BAJA', 1, 'Administración y gerencia', 1),
(7, 'OTRO', 'MEDIA', 2, 'Otras áreas no especificadas', 1);

-- ============================================================
-- 7) MODULO PERMISO (15 usuarios × 8 módulos = 120)
-- ============================================================
INSERT IGNORE INTO modulo_permiso (id_modulo_permiso, id_usuario, modulo, puede_acceder) VALUES
(1, 1, 'CLIENTES',1),(2, 1, 'EMPLEADOS',1),(3, 1, 'HABITACIONES',1),(4, 1, 'TIPOS_HABITACION',1),
(5, 1, 'RESERVAS',1),(6, 1, 'PAGOS',1),(7, 1, 'USUARIOS',1),(8, 1, 'INCIDENCIAS',1),
(9, 2, 'CLIENTES',1),(10, 2, 'EMPLEADOS',1),(11, 2, 'HABITACIONES',1),(12, 2, 'TIPOS_HABITACION',1),
(13, 2, 'RESERVAS',1),(14, 2, 'PAGOS',1),(15, 2, 'USUARIOS',1),(16, 2, 'INCIDENCIAS',1),
(17, 3, 'CLIENTES',1),(18, 3, 'EMPLEADOS',1),(19, 3, 'HABITACIONES',1),(20, 3, 'TIPOS_HABITACION',1),
(21, 3, 'RESERVAS',1),(22, 3, 'PAGOS',1),(23, 3, 'USUARIOS',1),(24, 3, 'INCIDENCIAS',1),
(25, 4, 'CLIENTES',1),(26, 4, 'EMPLEADOS',1),(27, 4, 'HABITACIONES',1),(28, 4, 'TIPOS_HABITACION',1),
(29, 4, 'RESERVAS',1),(30, 4, 'PAGOS',1),(31, 4, 'USUARIOS',1),(32, 4, 'INCIDENCIAS',1),
(33, 5, 'CLIENTES',1),(34, 5, 'EMPLEADOS',1),(35, 5, 'HABITACIONES',1),(36, 5, 'TIPOS_HABITACION',1),
(37, 5, 'RESERVAS',1),(38, 5, 'PAGOS',1),(39, 5, 'USUARIOS',1),(40, 5, 'INCIDENCIAS',1),
(41, 6, 'CLIENTES',1),(42, 6, 'EMPLEADOS',1),(43, 6, 'HABITACIONES',1),(44, 6, 'TIPOS_HABITACION',1),
(45, 6, 'RESERVAS',1),(46, 6, 'PAGOS',1),(47, 6, 'USUARIOS',1),(48, 6, 'INCIDENCIAS',1),
(49, 7, 'CLIENTES',1),(50, 7, 'EMPLEADOS',1),(51, 7, 'HABITACIONES',1),(52, 7, 'TIPOS_HABITACION',1),
(53, 7, 'RESERVAS',1),(54, 7, 'PAGOS',1),(55, 7, 'USUARIOS',1),(56, 7, 'INCIDENCIAS',1),
(57, 8, 'CLIENTES',1),(58, 8, 'EMPLEADOS',1),(59, 8, 'HABITACIONES',1),(60, 8, 'TIPOS_HABITACION',1),
(61, 8, 'RESERVAS',1),(62, 8, 'PAGOS',1),(63, 8, 'USUARIOS',1),(64, 8, 'INCIDENCIAS',1),
(65, 9, 'CLIENTES',1),(66, 9, 'EMPLEADOS',1),(67, 9, 'HABITACIONES',1),(68, 9, 'TIPOS_HABITACION',1),
(69, 9, 'RESERVAS',1),(70, 9, 'PAGOS',1),(71, 9, 'USUARIOS',1),(72, 9, 'INCIDENCIAS',1),
(73, 10, 'CLIENTES',1),(74, 10, 'EMPLEADOS',1),(75, 10, 'HABITACIONES',1),(76, 10, 'TIPOS_HABITACION',1),
(77, 10, 'RESERVAS',1),(78, 10, 'PAGOS',1),(79, 10, 'USUARIOS',1),(80, 10, 'INCIDENCIAS',1),
(81, 11, 'CLIENTES',1),(82, 11, 'EMPLEADOS',1),(83, 11, 'HABITACIONES',1),(84, 11, 'TIPOS_HABITACION',1),
(85, 11, 'RESERVAS',1),(86, 11, 'PAGOS',1),(87, 11, 'USUARIOS',1),(88, 11, 'INCIDENCIAS',1),
(89, 12, 'CLIENTES',1),(90, 12, 'EMPLEADOS',1),(91, 12, 'HABITACIONES',1),(92, 12, 'TIPOS_HABITACION',1),
(93, 12, 'RESERVAS',1),(94, 12, 'PAGOS',1),(95, 12, 'USUARIOS',1),(96, 12, 'INCIDENCIAS',1),
(97, 13, 'CLIENTES',1),(98, 13, 'EMPLEADOS',1),(99, 13, 'HABITACIONES',1),(100, 13, 'TIPOS_HABITACION',1),
(101, 13, 'RESERVAS',1),(102, 13, 'PAGOS',1),(103, 13, 'USUARIOS',1),(104, 13, 'INCIDENCIAS',1),
(105, 14, 'CLIENTES',1),(106, 14, 'EMPLEADOS',1),(107, 14, 'HABITACIONES',1),(108, 14, 'TIPOS_HABITACION',1),
(109, 14, 'RESERVAS',1),(110, 14, 'PAGOS',1),(111, 14, 'USUARIOS',1),(112, 14, 'INCIDENCIAS',1),
(113, 15, 'CLIENTES',1),(114, 15, 'EMPLEADOS',1),(115, 15, 'HABITACIONES',1),(116, 15, 'TIPOS_HABITACION',1),
(117, 15, 'RESERVAS',1),(118, 15, 'PAGOS',1),(119, 15, 'USUARIOS',1),(120, 15, 'INCIDENCIAS',1);

-- ============================================================
-- 8) RESERVA (20)
-- ============================================================
INSERT IGNORE INTO reserva (id_reserva, id_cliente, id_empleado, id_habitacion, fecha_reserva, fecha_ingreso, fecha_salida, estado_reserva) VALUES
(1, 1, 1, 6, '2025-01-10', '2025-01-15', '2025-01-18', 'COMPLETADA'),
(2, 2, 2, 5, '2025-01-20', '2025-01-25', '2025-01-27', 'COMPLETADA'),
(3, 3, 3, 3, '2025-02-05', '2025-02-10', '2025-02-14', 'COMPLETADA'),
(4, 4, 4, 1, '2025-02-15', '2025-02-20', '2025-02-22', 'COMPLETADA'),
(5, 5, 5, 2, '2025-03-01', '2025-03-05', '2025-03-08', 'COMPLETADA'),
(6, 6, 6, 4, '2025-03-10', '2025-03-14', '2025-03-16', 'COMPLETADA'),
(7, 7, 8, 7, '2025-03-20', '2025-03-26', '2025-03-29', 'COMPLETADA'),
(8, 8, 9, 8, '2025-04-01', '2025-04-05', '2025-04-07', 'COMPLETADA'),
(9, 9, 10, 9, '2025-04-10', '2025-04-15', '2025-04-18', 'CANCELADA'),
(10, 10, 11, 10, '2025-04-20', '2025-04-25', '2025-04-28', 'COMPLETADA'),
(11, 11, 12, 11, '2025-05-02', '2025-05-06', '2025-05-10', 'COMPLETADA'),
(12, 12, 13, 12, '2025-05-12', '2025-05-16', '2025-05-19', 'COMPLETADA'),
(13, 13, 14, 13, '2025-05-22', '2025-05-28', '2025-05-30', 'CANCELADA'),
(14, 14, 15, 14, '2025-06-05', '2025-06-10', '2025-06-13', 'COMPLETADA'),
(15, 15, 1, 15, '2025-06-15', '2025-06-20', '2025-06-23', 'COMPLETADA'),
(16, 6, 2, 16, '2025-07-01', '2025-07-05', '2025-07-08', 'COMPLETADA'),
(17, 7, 3, 17, '2025-07-12', '2025-07-18', '2025-07-21', 'COMPLETADA'),
(18, 8, 4, 18, '2025-08-01', '2025-08-05', '2025-08-08', 'COMPLETADA'),
(19, 9, 5, 19, '2025-08-10', '2025-08-15', '2025-08-18', 'CANCELADA'),
(20, 10, 6, 20, '2025-08-20', '2025-08-25', '2025-08-28', 'COMPLETADA');

-- ============================================================
-- 9) PAGO (20)
-- ============================================================
INSERT IGNORE INTO pago (id_pago, id_reserva, monto, fecha_pago, metodo_pago) VALUES
(1, 1, 200.00, '2025-01-15', 'TARJETA_CREDITO'),
(2, 2, 147.00, '2025-01-25', 'EFECTIVO'),
(3, 3, 276.00, '2025-02-10', 'TRANSFERENCIA'),
(4, 4, 95.00, '2025-02-20', 'YAPE'),
(5, 5, 246.00, '2025-03-05', 'TARJETA_DEBITO'),
(6, 6, 160.00, '2025-03-14', 'EFECTIVO'),
(7, 7, 265.00, '2025-03-26', 'TRANSFERENCIA'),
(8, 8, 180.00, '2025-04-05', 'YAPE'),
(9, 9, 50.00, '2025-04-15', 'PLIN'),
(10, 10, 140.00, '2025-04-25', 'TARJETA_CREDITO'),
(11, 11, 400.00, '2025-05-06', 'TRANSFERENCIA'),
(12, 12, 360.00, '2025-05-16', 'YAPE'),
(13, 13, 80.00, '2025-05-28', 'EFECTIVO'),
(14, 14, 260.00, '2025-06-10', 'TARJETA_DEBITO'),
(15, 15, 750.00, '2025-06-20', 'TRANSFERENCIA'),
(16, 16, 350.00, '2025-07-05', 'TARJETA_CREDITO'),
(17, 17, 450.00, '2025-07-18', 'YAPE'),
(18, 18, 240.00, '2025-08-05', 'PLIN'),
(19, 19, 100.00, '2025-08-15', 'EFECTIVO'),
(20, 20, 410.00, '2025-08-25', 'TRANSFERENCIA');

-- ============================================================
-- 10) INCIDENCIA (20)
-- ============================================================
INSERT IGNORE INTO incidencia (id_incidencia, id_empleado_registra, id_cliente, id_habitacion, id_area, fecha, tipo, descripcion, prioridad, estado, fecha_resolucion, notas_internas, es_recurrente, veces_resuelta) VALUES
(1, 1, 1, 6, 3, '2025-01-16', 'DAÑO_HABITACION', 'Aire acondicionado no enfría en habitación 106', 'ALTA', 'RESUELTO', '2025-01-17', 'Reparado el 17/01', 0, 1),
(2, 3, NULL, 3, 3, '2025-02-12', 'FALLA_EQUIPO', 'TV no enciende en habitación 103', 'MEDIA', 'RESUELTO', '2025-02-13', 'Cambiado fusible', 0, 1),
(3, 5, 3, NULL, 2, '2025-03-06', 'QUEJA_HUESPED', 'Huésped del 105 reporta ruido de construcción', 'URGENTE', 'CERRADO', NULL, 'Notificado a construcción', 0, 0),
(4, 2, 4, 1, 7, '2025-03-22', 'OTRO', 'Llave magnética no funciona en habitación 101', 'BAJA', 'CERRADO', NULL, 'Reprogramada tarjeta', 0, 0),
(5, 6, 5, 6, 3, '2025-04-02', 'DAÑO_HABITACION', 'Ducha sin agua caliente en habitación 106', 'ALTA', 'RESUELTO', '2025-04-03', 'Terma reparada', 0, 1),
(6, 8, NULL, 7, 3, '2025-04-08', 'FALLA_EQUIPO', 'Secador de pelo no funciona en habitación 107', 'BAJA', 'RESUELTO', '2025-04-09', 'Reemplazado', 0, 1),
(7, 9, 6, NULL, 4, '2025-05-07', 'PROBLEMA_SERVICIO', 'Toallas no cambiadas en habitación 201', 'MEDIA', 'CERRADO', NULL, 'Ama de llaves notificada', 0, 0),
(8, 10, 7, 8, 2, '2025-05-18', 'QUEJA_HUESPED', 'Ruido de fiesta en habitación contigua', 'URGENTE', 'RESUELTO', '2025-05-19', 'Seguridad intervino', 0, 1),
(9, 11, NULL, 9, 3, '2025-06-12', 'DAÑO_HABITACION', 'Cama rota en habitación 109', 'ALTA', 'CERRADO', NULL, 'Cambio de mobiliario', 0, 0),
(10, 12, 8, 10, 7, '2025-07-06', 'OTRO', 'Huésped olvidó pertenencias', 'BAJA', 'CERRADO', NULL, 'Entregado en recepción', 0, 0),
(11, 13, 9, NULL, 2, '2025-07-20', 'QUEJA_HUESPED', 'Wifi inestable en piso 2', 'MEDIA', 'RESUELTO', '2025-07-21', 'Router reemplazado', 0, 1),
(12, 14, 10, 11, 3, '2025-08-03', 'DAÑO_HABITACION', 'Inodoro tapado en habitación 201', 'ALTA', 'RESUELTO', '2025-08-04', 'Destapado con éxito', 0, 1),
(13, 15, NULL, 12, 3, '2025-08-10', 'FALLA_EQUIPO', 'Microondas no calienta en habitación 202', 'MEDIA', 'CERRADO', NULL, 'Reemplazado', 0, 0),
(14, 1, 11, 13, 4, '2025-09-04', 'PROBLEMA_SERVICIO', 'No hubo servicio de limpieza por 2 días', 'MEDIA', 'RESUELTO', '2025-09-05', 'Programación corregida', 0, 1),
(15, 3, 12, 14, 2, '2025-09-22', 'QUEJA_HUESPED', 'Personal de mantenimiento entró sin avisar', 'URGENTE', 'CERRADO', NULL, 'Capacitación al personal', 0, 0),
(16, 5, NULL, 15, 3, '2025-10-06', 'DAÑO_HABITACION', 'Persiana rota en habitación 205', 'BAJA', 'RESUELTO', '2025-10-07', 'Persiana reemplazada', 0, 1),
(17, 6, 13, 16, 7, '2025-10-16', 'OTRO', 'Maleta dañada por personal de hotel', 'ALTA', 'RESUELTO', '2025-10-17', 'Compensación al huésped', 0, 1),
(18, 8, 14, 17, 3, '2025-11-03', 'FALLA_EQUIPO', 'Aire acondicionado ruidoso en habitación 207', 'MEDIA', 'CERRADO', NULL, 'Mantenimiento preventivo', 0, 0),
(19, 9, NULL, 18, 4, '2025-11-12', 'PROBLEMA_SERVICIO', 'Agua caliente tarda 10 min en salir', 'BAJA', 'RESUELTO', '2025-11-13', 'Válvula ajustada', 0, 1),
(20, 10, 15, 19, 3, '2025-11-22', 'DAÑO_HABITACION', 'Lámpara de mesa no prende', 'BAJA', 'RESUELTO', '2025-11-23', 'Bombillo reemplazado', 0, 1);

-- ============================================================
-- 11) INCIDENCIA_RESOLUCION — Historial de resoluciones (12)
-- ============================================================
INSERT IGNORE INTO incidencia_resolucion (id_resolucion, id_incidencia, version, fecha_resolucion, solucion, id_empleado_resuelve, notas_auditoria) VALUES
(1, 1, 1, '2025-01-17', 'Resuelto: Reparado el 17/01', NULL, 'Migrado del sistema anterior'),
(2, 2, 1, '2025-02-13', 'Resuelto: Cambiado fusible', NULL, 'Migrado del sistema anterior'),
(3, 5, 1, '2025-04-03', 'Resuelto: Terma reparada', NULL, 'Migrado del sistema anterior'),
(4, 6, 1, '2025-04-09', 'Resuelto: Reemplazado', NULL, 'Migrado del sistema anterior'),
(5, 8, 1, '2025-05-19', 'Resuelto: Seguridad intervino', NULL, 'Migrado del sistema anterior'),
(6, 11, 1, '2025-07-21', 'Resuelto: Router reemplazado', NULL, 'Migrado del sistema anterior'),
(7, 12, 1, '2025-08-04', 'Resuelto: Destapado con éxito', NULL, 'Migrado del sistema anterior'),
(8, 14, 1, '2025-09-05', 'Resuelto: Programación corregida', NULL, 'Migrado del sistema anterior'),
(9, 16, 1, '2025-10-07', 'Resuelto: Persiana reemplazada', NULL, 'Migrado del sistema anterior'),
(10, 17, 1, '2025-10-17', 'Resuelto: Compensación al huésped', NULL, 'Migrado del sistema anterior'),
(11, 19, 1, '2025-11-13', 'Resuelto: Válvula ajustada', NULL, 'Migrado del sistema anterior'),
(12, 20, 1, '2025-11-23', 'Resuelto: Bombillo reemplazado', NULL, 'Migrado del sistema anterior');
