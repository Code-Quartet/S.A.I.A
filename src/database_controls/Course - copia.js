const path = require('path')
const fs = require('fs')
const os_system = require('os')
const { v4: uuidv4 } = require('uuid');
/*-------------------------------------*/
const SAIADB = require(path.join(__dirname, '../../src/database_controls/SAIA_manager.js'));
const DB = new SAIADB(path.join(__dirname, '../../database/SAIA.db'));
/*--------------LINK BASE DE DATOS ------------------------*/


async function InsertCourse(formData) {
    const sql = `INSERT INTO Course (
        Key, Name, Description, Instructor_ID, Days, 
        Start_Time, End_Time, Duration_Value, Duration_Unit, Status, 
        Cost, Capacity, Has_Evaluation, Has_Certificate,
        Date_Created, Time_Created, Status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE('now'), TIME('now'), 'Activo')`;

    const key = uuidv4();

    const params = [
        key,
        formData.nombre,
        formData.descripcion,
        formData.instructor,
        Array.isArray(formData.dias) ? formData.dias.join(',') : '', 
        formData.hora_inicio,
        formData.hora_fin,
        parseInt(formData.duracion_valor) || 0,
        formData.duracion_unidad,
        formData.estado,
        formData.costo || "0",
        formData.cupo || "0",
        formData.evaluacion === 'on' ? 1 : 0, // Conversión de "on" a booleano
        formData.certificado === 'on' ? 1 : 0  // Conversión de "on" a booleano
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

async function UpdateCourse(key, formData) {
    // 1. Definimos el SQL
    const sql = `UPDATE Course SET 
        Name = ?, 
        Description = ?, 
        Instructor_ID = ?, 
        Days = ?, 
        Start_Time = ?, 
        End_Time = ?, 
        Duration_Value = ?, 
        Duration_Unit = ?,
        Cost = ?,
        Status = ?, 
        Capacity = ?,
        Has_Evaluation = ?,
        Has_Certificate = ?
        WHERE Key = ?`;

    // 2. Preparamos los parámetros asegurando que cada "?" tenga su valor
    const params = [
        formData.nombre,
        formData.descripcion,
        formData.instructor,
        // Si el frontend envía un array, lo unimos; si ya es string, lo dejamos; si no existe, vacío.
        Array.isArray(formData.dias) ? formData.dias.join(',') : (formData.dias || ''),
        formData.hora_inicio,
        formData.hora_fin,
        parseInt(formData.duracion_valor) || 0,
        formData.duracion_unidad,
        formData.costo,
               formData.estado,
        parseInt(formData.cupo) || 0, // <--- ERROR CORREGIDO: Faltaba este valor en params
        // Lógica para capturar booleanos de checkboxes:
        (formData.evaluacion === 'on' || formData.evaluacion === 1 || formData.evaluacion === true) ? 1 : 0,
        (formData.certificado === 'on' || formData.certificado === 1 || formData.certificado === true) ? 1 : 0,
        key // El WHERE Key = ?
    ];

    try {
        await DB.conectar();
        return await DB.actualizar(sql, params);
    } catch (error) {
        console.error("Error al actualizar curso:", error);
        throw error;
    }
}
    /**
     * Borrado lógico (Marca fecha de eliminación)
     */
async function DeleteCourse(key) {
        const sql = `UPDATE Course SET Time_Deleted = DATE('now') WHERE Key = ?`;
        return await DB.borrar(sql, [key]);
}

/*--------------funciones de busqueda para el manage course---------------*/
async function GetCoursePaged(page = 1, limit = 10) {
    try {
        await DB.conectar();
        
        // 1. Obtener el total de elementos activos
        const sqlCount = `SELECT COUNT(*) as total FROM Course WHERE Time_Deleted IS NULL`;
        const resCount = await DB.buscar(sqlCount);
        const totalElements = resCount?.total ?? 0;

        // 2. Lógica adaptativa de paginación
        let finalLimit = limit;
        let finalOffset = (page - 1) * limit;
        let finalPage = page;

        // Si hay pocos elementos, forzamos vista única (desactivamos paginación)
        if (totalElements <= 20) {
            finalLimit = 20; 
            finalOffset = 0;
            finalPage = 1;
        }

        // 3. Consultar datos con la subconsulta corregida para la tabla intermedia
        const sqlData = `
            SELECT 
                C.Key, C.Name, C.Capacity, C.Start_Time, C.End_Time, 
                C.Status, C.Cost, C.Days, C.Instructor_ID,
                I.Name as Instructor_Name,
                (SELECT COUNT(*) FROM Student_Courses SC WHERE SC.Id_curs = C.Key) AS Total_Students
            FROM Course C
            LEFT JOIN Instructor I ON C.Instructor_ID = I.Key
            WHERE C.Time_Deleted IS NULL 
            ORDER BY C.Date_Created DESC, C.Time_Created ASC 
            LIMIT ? OFFSET ?`;

        const courses = await DB.buscarTodo(sqlData, [finalLimit, finalOffset]);
        
        // 4. Calcular total de páginas basándonos en el límite final
        const totalPages = Math.ceil(totalElements / finalLimit);

        // Caso: No hay registros o la página solicitada está fuera de rango
        if (!courses || courses.length === 0) {
            return {
                success: false,
                message: "No se encontraron cursos en esta sección.",
                data: [],
                pagination: {
                    totalElements,
                    totalPages,
                    currentPage: finalPage,
                    limit: finalLimit,
                    isPaged: totalElements > 20
                }
            };
        }

        // Caso: Éxito con datos
        return {
            success: true,
            data: courses,
            pagination: {
                totalElements,
                totalPages,
                currentPage: finalPage,
                limit: finalLimit,
                hasNext: finalPage < totalPages,
                hasPrev: finalPage > 1,
                isPaged: totalElements > 20
            }
        };

    } catch (error) {
        console.error("Error en GetCoursePaged:", error);
        return { 
            success: false, 
            data: [], 
            message: "Error interno al obtener la lista de cursos." 
        };
    }
}
async function SearchCourseByStatus(statusArray) {
    try {
        if (!statusArray || !Array.isArray(statusArray) || statusArray.length === 0) {
            return { success: false, message: "No se seleccionaron estados." };
        }

        const placeholders = statusArray.map(() => "?").join(",");
        const sql = `
            SELECT 
                C.*,
                I.Name as Instructor_Name,
                (SELECT COUNT(*) FROM Student_Courses SC WHERE SC.Id_curs = C.Key) AS Total_Students
            FROM Course C
            LEFT JOIN Instructor I ON C.Instructor_ID = I.Key
            WHERE C.Status IN (${placeholders}) 
              AND C.Time_Deleted IS NULL 
            ORDER BY C.Name ASC`;

        const results = await DB.buscarTodo(sql, statusArray);

        return { 
            success: results.length > 0, 
            data: results, 
            message: results.length > 0 ? "" : "No hay cursos en estos estados." 
        };
    } catch (error) {
        return { success: false, message: "Error al filtrar por estado." };
    }
}

async function SearchCourse(searchTerm) {
    try {
        const termClean = searchTerm ? searchTerm.trim() : "";
        if (!termClean) return { success: false, message: "Debe ingresar un nombre o código." };

        const sql = `
            SELECT 
                c.*, 
                i.Name AS Instructor_Name,
                (SELECT COUNT(*) FROM Student_Courses sc WHERE sc.Id_curs = c.Key) AS Total_Students
            FROM Course c
            LEFT JOIN Instructor i ON c.Instructor_ID = i.Key
            WHERE c.Time_Deleted IS NULL 
              AND (c.Name LIKE ? OR c.Status LIKE ?)
            ORDER BY c.Name ASC`;
        
        const wildCardTerm = `%${termClean}%`;
        const results = await DB.buscarTodo(sql, [wildCardTerm, wildCardTerm]);

        return { 
            success: results.length > 0, 
            data: results, 
            count: results.length,
            message: results.length > 0 ? "" : "No se encontraron resultados."
        };
    } catch (error) {
        return { success: false, message: "Error en la búsqueda.", data: [] };
    }
}

async function InformationCourseSelect(key) {
    try {
        const sql = `
            SELECT 
                c.*, 
                i.Name AS Nombre_Instructor,
                (SELECT COUNT(*) FROM Student_Courses sc WHERE sc.Id_curs = c.Key) AS Total_Students
            FROM Course c
            LEFT JOIN Instructor i ON c.Instructor_ID = i.Key
            WHERE c.Time_Deleted IS NULL AND c.Key = ?
        `;
        return await DB.buscar(sql, [key]);
    } catch (error) {
        console.error("Error al obtener información del curso:", error);
        return null;
    }
}


async function GetAllKeyNameInnstructor() {
 
    return await DB.buscarTodo(`SELECT Key, Name FROM Instructor ORDER BY Name ASC`);

}

async function SelectUpdateCourseKey(key) {
    const sql = `
        SELECT c.*, i.Name AS Nombre_Instructor 
        FROM Course c
        LEFT JOIN Instructor i ON c.Instructor_ID = i.Key
        WHERE c.Time_Deleted IS NULL AND c.Key = ?`;
    return await DB.buscar(sql, [key]);
}
/*--------------funciones de busqueda para el manage course----------------*/

/*funcion para el uso del Dasboard*/
async function GetTopCourses() {
    try {
        await DB.conectar();

        // Seleccionamos los campos principales
        // Limitamos a 10 y ordenamos por fecha de creación (los más recientes primero)
        const sql = `
            SELECT 
                Key, 
                Name, 
                Description, 
                Days, 
                Start_Time, 
                End_Time, 
                Capacity,
                Cost, 
                Status, 
                Date_Created
            FROM Course
            WHERE Time_Deleted IS NULL AND Status = 'Activo'
            ORDER BY Date_Created DESC, Time_Created DESC
            LIMIT 10`;

        const results = await DB.buscarTodo(sql);

        if (!results || results.length === 0) {
            return {
                success: false,
                message: "No se encontraron cursos registrados."
            };
        }

        return {
            success: true,
            data: results
        };

    } catch (error) {
        console.error("Error al obtener los cursos:", error);
        return {
            success: false,
            message: "Error al intentar recuperar la lista de cursos."
        };
    }
}

module.exports={
    InsertCourse:InsertCourse,
    UpdateCourse:UpdateCourse,
    DeleteCourse:DeleteCourse,
    SearchCourse:SearchCourse,
    GetAllKeyNameInnstructor,
    SelectUpdateCourseKey:SelectUpdateCourseKey,
    GetCoursePaged:GetCoursePaged,
    SearchCourseByStatus:SearchCourseByStatus,
    InformationCourseSelect:InformationCourseSelect,
    GetTopCourses:GetTopCourses
}
