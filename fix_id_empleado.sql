-- Permitir NULL en id_empleado para reservas creadas desde el chatbot
USE dvita_db;

-- Modificar la columna para permitir NULL
ALTER TABLE reserva MODIFY COLUMN id_empleado BIGINT NULL;
