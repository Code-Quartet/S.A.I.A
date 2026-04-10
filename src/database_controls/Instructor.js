const path = require('path')
const fs = require('fs')
const os_system = require('os')
const { v4: uuidv4 } = require('uuid');
/*-------------------------------------*/
const SAIADB = require(path.join(__dirname, '../../src/database_controls/SAIA_manager.js'));
const DB = new SAIADB(path.join(__dirname, '../../database/SAIA.DB'));
/*------------------------------------------*/

async function SearchInstructor(term) {
    try {
        await DB.conectar();
        const searchTerm = term ? term.trim() : "";

        if (!searchTerm) {
            return { success: false, message: "Debe ingresar un nombre o código." };
        }

        // CORRECCIÓN: Se eliminaron los alias "S." que no existían en esta consulta.
        // Se agregaron campos necesarios para el ordenamiento si se requieren.
        const sql = `
            SELECT Key, Name, Specialty, Tlf, Status, Date_Created, Time_Created
            FROM Instructor
            WHERE (Name LIKE ? OR Cod_id = ?) 
            AND Time_Deleted IS NULL 
            ORDER BY Date_Created DESC, Time_Created DESC`;

        const results = await DB.buscarTodo(sql, [`%${searchTerm}%`, searchTerm]);

        if (!results || results.length === 0) {
            return {
                success: false,
                message: `No se encontró ningún Instructor que coincida con: "${searchTerm}"`
            };
        }

        return { success: true, data: results };

    } catch (error) {
        console.error("Error en searchInstructor:", error);
        return { success: false, message: "Error de conexión con la base de datos." };
    }
}
/**
 * Obtiene Name, Specialty, Tlf y Status de todos los instructores activos.
 */
async function SelectInstructor(key) {
    try {
        await DB.conectar();
        const sql = `SELECT * FROM Instructor WHERE Key = ? AND Time_Deleted IS NULL`;
        return await DB.buscar(sql, [key]);
    } catch (error) {
        console.error("Error en SelectInstructor:", error);
        return null;
    }
}


async function GetInstructorsPaged(page = 1, limit = 10) {
    try {
        // 1. Obtener el total de instructores activos (sin borrado lógico)
        const sqlCount = `SELECT COUNT(*) as total FROM Instructor WHERE Time_Deleted IS NULL`;
        const resCount = await DB.buscar(sqlCount);
        
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
            SELECT Key, Name, Specialty, Tlf, Status, Date_Created, Time_Created
            FROM Instructor 
            WHERE Time_Deleted IS NULL 
            ORDER BY Date_Created DESC, Time_Created DESC 
            LIMIT ? OFFSET ?`;
        const instructors = await DB.buscarTodo(sqlData, [finalLimit, offset]);

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
        await DB.conectar();

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
            AND Time_Deleted IS NULL 
            ORDER BY Name ASC`;


        // Pasamos el arreglo de estados directamente como parámetros
        const results = await DB.buscarTodo(sql, statusArray);

        if (!results || results.length === 0) {
            return { success: false, data: [], message: "Sin resultados." };
        }

        return { success: true, data: results };

    } catch (error) {
        console.error("Error en búsqueda por status:", error);
        return { success: false, message: "Error en la base de datos." };
    }
}

async function InsertInstructor(data) {
    try {
        await DB.conectar();
        const key = uuidv4();
        // CORRECCIÓN: Faltaban 2 "?" en VALUES para completar los 13 campos definidos.
        const sql = `
            INSERT INTO Instructor (
                Key, Name, Cod_id, Address, Tlf, E_mail, Image, 
                Age, Status, Specialty, Certifications, Date_Created, Time_Created
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, date('now'), time('now'))`;
        
        const params = [
            key,
            data.nombre || null,
            data.cedula || null,
            data.direccion || null,
            data.telefono || null,
            data.correo || null,
            data.imagen || null,
            data.edad || null,
            data.estado || 'Activo',
            data.especialidad || null,
            data.certificaciones || null
        ];
        
        return await DB.crear(sql, params);
    } catch (error) {
        console.error("Error en InsertInstructor:", error);
        throw error;
    }
}

/**
 * Actualiza un instructor.
 */
async function UpdateInstructor(key, data) {
    try {
        await DB.conectar();
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
        
        return await DB.actualizar(sql, params);
    } catch (error) {
        console.error("Error en UpdateInstructor:", error);
        throw error;
    }
}

async function DeleteInstructor(instructorKey){

     console.log("DeleteInstructor",instructorKey)

    const STATUS_REQUIRED = "Despedido";
    try {
        await DB.beginTransaction();

        // 1. Obtener Status para validar condiciones
        const sqlFind = `SELECT Status FROM Instructor WHERE Key = ? AND Time_Deleted IS NULL`;
        const instructor = await DB.buscar(sqlFind, [instructorKey]);

        //console.log("instructor",instructor)
        
        // Validar existencia
        if (!instructor) {
            await DB.rollback();
            return {
                success: false,
                title:"warning",
                type:"warning",
                message: "El instructor no existe o ya fue desactivado." };
        }

        // 2. Validar que el Status sea el correcto para proceder
        if (instructor.Status !== STATUS_REQUIRED) {
            await DB.rollback();
            return { 
                success: false,
                title:"Error",
                type:"error",
                message: `No se puede eliminar: El estado actual es '${instructor.Status}', pero debe ser '${STATUS_REQUIRED}'.` 
            };
        }

        const userKey = instructor.Id_user;

        // 3. Marcar borrado lógico en instructor
        const sqlDelinstructor = `UPDATE Instructor SET Time_Deleted = date('now') WHERE Key = ?`;
        await DB.actualizar(sqlDelinstructor, [instructorKey]);

        // 4. Marcar borrado lógico en User si existe relación
        if (userKey) {
            const sqlDelUser = `UPDATE User SET Time_Deleted = date('now') WHERE Key = ?`;
            await DB.actualizar(sqlDelUser, [userKey]);
        }

        await DB.commit();
        return { success: true,
         title:"info", 
         type:"info",
         message: "Registro desactivado con éxito." };

    } catch (error) {
        // Aseguramos el rollback en caso de cualquier error de DB
        if (DB.inTransaction) await DB.rollback();
        console.error("Error en el borrado lógico:", error);
        return { success: false, message: "Error interno en el servidor." };
    }

       
}

async function PermanentErase(key) {
    const sql = `DELETE FROM Instructor WHERE Key = ?`;
    return await DB.borrar(sql, [key]);
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