const path = require('path')
const fs = require('fs')
const os_system = require('os')
const { v4: uuidv4 } = require('uuid');
/*-------------------------------------*/
//console.log(path.join(__dirname,'../DataBase/SAIA_manager.js'))
const SAIADB = require(path.join(__dirname,'../DataBase/SAIA_manager.js'))
//console.log(path.join(__dirname,'../DataBase/SAIA.db'))
const DB = new SAIADB(path.join(__dirname,'../DataBase/SAIA.db'));
/*--------------LINK BASE DE DATOS ------------------------*/


    async function insertarCurso(formData) {
        const sql = `INSERT INTO Course (
            Key, Name, Description, Instructor_ID, Days, 
            Start_Time, End_Time, Duration_Value, Duration_Unit, 
            Date_Created, Time_Created, Status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, DATE('now'), TIME('now'), 'Activo')`;

        // Generamos una Key única basada en el timestamp (similar a tu ejemplo LPT-001A)
        const key = uuidv4();

        const params = [
            key,
            formData.nombre,
            formData.descripcion,
            formData.instructor,
            formData.dias.join(','), // Convertimos el array ["Lun", "Mie"] a string "Lun,Mie"
            formData.hora_inicio,
            formData.hora_fin,
            parseInt(formData.duracion_valor),
            formData.duracion_unidad
        ];

        try {
            return await DB.crear(sql, params);
        } catch (err) {
            console.error("Error al insertar curso:", err);
            throw err;
        }
    }

    /**
     * Actualiza un curso existente
     */
    async function actualizarCurso(key, formData) {
        const sql = `UPDATE Course SET 
            Name = ?, 
            Description = ?, 
            Instructor_ID = ?, 
            Days = ?, 
            Start_Time = ?, 
            End_Time = ?, 
            Duration_Value = ?, 
            Duration_Unit = ?
            WHERE Key = ?`;

        const params = [
            formData.nombre,
            formData.descripcion,
            formData.instructor,
            formData.dias.join(','),
            formData.hora_inicio,
            formData.hora_fin,
            parseInt(formData.duracion_valor),
            formData.duracion_unidad,
            key
        ];

        return await DB.actualizar(sql, params);
    }

    /**
     * Borrado lógico (Marca fecha de eliminación)
     */
    async function eliminarCurso(key) {
        const sql = `UPDATE Course SET Time_Deleted = DATE('now') WHERE Key = ?`;
        return await DB.borrar(sql, [key]);
    }


    async function obtenerTodosLosCursos() {
    const sql = `
        SELECT 
            c.*, 
            i.Nombre AS Nombre_Instructor 
        FROM Course c
        LEFT JOIN Instructors i ON c.Instructor_ID = i.ID
        WHERE c.Time_Deleted IS NULL
        ORDER BY c.Date_Created DESC;
    `;
    
    try {
        return await DB.buscarTodo(sql);
    } catch (err) {
        console.error("Error al obtener cursos:", err);
        throw err;
    }
}

async function buscarCursos(filtros) {
    let sql = `
        SELECT c.*, i.Nombre AS Nombre_Instructor 
        FROM Course c
        LEFT JOIN Instructors i ON c.Instructor_ID = i.ID
        WHERE c.Time_Deleted IS NULL
    `;
    const params = [];

    // Filtro por Nombre de Curso (Busca coincidencias parciales)
    if (filtros.curso) {
        sql += ` AND c.Name LIKE ?`;
        params.push(`%${filtros.curso}%`);
    }

    // Filtro por Nombre de Instructor
    if (filtros.instructor) {
        sql += ` AND i.Nombre LIKE ?`;
        params.push(`%${filtros.instructor}%`);
    }

    // Filtro por Estado (Búsqueda exacta)
    if (filtros.estado && filtros.estado !== 'Todos') {
        sql += ` AND c.Status = ?`;
        params.push(filtros.estado);
    }

    return await DB.buscarTodo(sql, params);
}

module.exports={
    insertarCurso:insertarCurso,
    actualizarCurso:actualizarCurso,
    eliminarCurso:eliminarCurso

}