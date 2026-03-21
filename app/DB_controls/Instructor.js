const path = require('path')
const fs = require('fs')
const os_system = require('os')
const { v4: uuidv4 } = require('uuid');
/*-------------------------------------*/
const SAIADB = require(path.join(__dirname,'../DataBase/SAIA_manager.js'))
const db = new SAIADB(path.join(__dirname,'../DataBase/SAIA.db'));
/*--------------LINK BASE DE DATOS ------------------------*/

/**
 * Busca instructores por Nombre, Cédula o Especialidad.
 * Utiliza búsqueda parcial (LIKE) y filtra los que no han sido eliminados.
 */
 /*
async function SearchInstructor(query) {
    const sql = `
        SELECT * FROM Instructor 
        WHERE (Name LIKE ? OR Cod_id LIKE ? OR Specialty LIKE ?) 
        AND Time_deleted IS NULL`;
    const term = `%${query}%`;
    return await db.leer(sql, [term, term, term]);
}
*/

async function SearchInstructor(term) {
    try {
        await db.conectar();

        // 1. Limpiamos el término de búsqueda para evitar espacios vacíos
        const searchTerm = term ? term.trim() : "";

        if (!searchTerm) {
            return { success: false, message: "Debe ingresar un nombre o código." };
        }

        // 2. Usamos el operador OR para buscar en ambas columnas simultáneamente
        // Usamos LIKE para el nombre (coincidencia parcial) y = para el Cod_id (coincidencia exacta)
        const sql = `
            SELECT Key, Name, Specialty, Tlf, Status
            FROM Instructor
            WHERE (Name LIKE ? OR Cod_id = ?) 
            AND Time_deleted IS NULL 
            ORDER BY Name ASC`;

        // 3. Ejecutamos la búsqueda
        // Pasamos %term% para el LIKE y el término limpio para el =
        const results = await db.buscar(sql, [`%${searchTerm}%`, searchTerm]);

        // 4. Verificación de resultados
        if (!results || results.length === 0) {
            return {
                success: false,
                message: `No se encontró ningún Instructor que coincida con: "${searchTerm}"`
            };
        }

        // 5. Retorno de la data (Sin envolver en [] adicionales para evitar errores de lectura)
        return {
            success: true,
            data: [results] 
        };

    } catch (error) {
        console.error("Error en searchInstructor:", error);
        return { 
            success: false, 
            message: "Error de conexión con la base de datos." 
        };
    }
}
/**
 * Obtiene Name, Specialty, Tlf y Status de todos los instructores activos.
 */
async function SelectInstructor(key) {
    const sql = `SELECT * FROM Instructor WHERE key=? AND Time_deleted IS NULL`;
    return await db.buscar(sql,[key]);
}


async function GetInstructorsPaged(page = 1, limit = 10) {
    try {
        // 1. Obtener el total de instructores activos (sin borrado lógico)
        const sqlCount = `SELECT COUNT(*) as total FROM Instructor WHERE Time_deleted IS NULL`;
        const resCount = await db.buscar(sqlCount);
        
        // Manejo de respuesta según como retorne el objeto tu método .buscar()
        const totalElements = resCount?.total ?? 0;

        // 2. Lógica adaptativa:
        // Si hay 20 o menos, forzamos mostrar todo en una sola vista
        let finalLimit = limit;
        let offset = (page - 1) * limit;

        if (totalElements <= 20) {
            finalLimit = totalElements;
            offset = 0;
        }

        // 3. Consulta de los campos específicos solicitados
        const sqlData = `
            SELECT Key, Name, Specialty, Tlf, Status
            FROM Instructor 
            WHERE Time_deleted IS NULL 
            ORDER BY Name ASC 
            LIMIT ? OFFSET ?`;

        const instructors = await db.buscarTodo(sqlData, [finalLimit, offset]);

        // 4. Calcular total de páginas
        const totalPages = totalElements <= 20 ? 1 : Math.ceil(totalElements / limit);

        if(!instructors || instructors.length === 0) {
                return {
                    success: false,
                    message: `No se encontraron instructores`,
                    pagination: {
                    totalElements,
                    totalPages,
                    currentPage: totalElements <= 20 ? 1 : page,
                    limit: finalLimit,
                    isPaged: totalElements > 20 // Flag para saber si mostrar controles de paginación en el frontend
                }
            };
        }


        return {
            success: true,
            data: instructors,
            pagination: {
                totalElements,
                totalPages,
                currentPage: totalElements <= 20 ? 1 : page,
                limit: finalLimit,
                isPaged: totalElements > 20 // Flag para saber si mostrar controles de paginación en el frontend
            }
        };



    } catch (error) {
        console.error("Error en GetInstructorsPaged:", error);
        return { 
            success: false, 
            message: "Error al obtener la lista de instructores." 
        };
    }
}


async function searchInstructorByStatus(statusArray) {
    try {
        await db.conectar();

        if (!statusArray || statusArray.length === 0) {
            // Si no hay filtros, podrías retornar todos o ninguno
            return { success: false, message: "No se seleccionaron filtros." };
        }

        // Creamos los marcadores de posición (?, ?, ?) según la cantidad de estados
        const placeholders = statusArray.map(() => "?").join(",");

        const sql = `
            SELECT Key, Name, Cod_id, Tlf, Status, Specialty
            FROM Instructor 
            WHERE Status IN (${placeholders}) 
            AND Time_deleted IS NULL 
            ORDER BY Name ASC`;

        // Pasamos el arreglo de estados directamente como parámetros
        const results = await db.buscarTodo(sql, statusArray);

        if (!results || results.length === 0) {
            return { success: false, data: [], message: "Sin resultados." };
        }

        return { success: true, data: results };

    } catch (error) {
        console.error("Error en búsqueda por status:", error);
        return { success: false, message: "Error en la base de datos." };
    }
}

/**
 * Inserta un nuevo instructor mapeando el objeto recibido.
 * Genera automáticamente la fecha y hora de creación.
 */
async function InsertInstructor(data) {

    const key = uuidv4();
    const sql = `
        INSERT INTO Instructor (
            Key, Name, Cod_id, Address, Tlf, E_mail, Image, 
            Age, Status, Specialty, Certifications, Date, Time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, date('now'), time('now'))`;
    
    const params = [
        key,                // UUID o ID único generado previamente
        data.nombre,        // Name
        data.cedula,        // Cod_id
        data.direccion,     // Address
        data.telefono,      // Tlf
        data.correo,        // E_mail
        data.imagen,        // Image
        data.edad,          // Age
        data.estado,        // Status
        data.especialidad,  // Specialty
        data.certificaciones// Certifications
    ];
    
    return await db.crear(sql, params);
}


/**
 * Actualiza un instructor existente mediante su Key.
 */
async function UpdateInstructor(key, data) {
    const sql = `
        UPDATE Instructor SET 
            Name = ?, Cod_id = ?, Address = ?, Tlf = ?, 
            E_mail = ?, Image = ?, Age = ?, Status = ?, 
            Specialty = ?, Certifications = ?
        WHERE Key = ?`;
    
    const params = [
        data.nombre, data.cedula, data.direccion, data.telefono,
        data.correo, data.imagen, data.edad, data.estado,
        data.especialidad, data.certificaciones, key
    ];
    
    return await db.actualizar(sql, params);
}

/**
 * Borrado Inteligente (Lógico): Registra la fecha de eliminación.
 */
async function DeleteInstructor(key) {
    const sql = `UPDATE Instructor SET Time_deleted = date('now') WHERE Key = ?`;
    return await db.actualizar(sql, [key]);
}

/**
 * Borrado Permanente (Físico): Elimina el registro por completo.
 */
async function PermanentErase(key) {
    const sql = `DELETE FROM Instructor WHERE Key = ?`;
    return await db.borrar(sql, [key]);
}

module.exports={
    SelectInstructor:SelectInstructor,
    GetInstructorsPaged:GetInstructorsPaged,
    SearchInstructor:SearchInstructor,
    InsertInstructor:InsertInstructor,
    UpdateInstructor:UpdateInstructor,
    searchInstructorByStatus:searchInstructorByStatus,
    DeleteInstructor:DeleteInstructor,
    PermanentErase:PermanentErase
}