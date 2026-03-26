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

/*--------------------------------------------------------------*/
// --- CURSOS EN PAPELERA ---
async function GetCoursePagedTrash(page = 1, limit = 10) {
    try {
        await DB.conectar();
          const sqlCount = `SELECT COUNT(*) as total FROM Course WHERE Time_Deleted IS NOT NULL`;
        const resCount = await DB.buscar(sqlCount);
        
        const totalElements = resCount?.total ?? 0;

        let finalLimit = totalElements <= 20 ? 20 : limit;
        let offset = totalElements <= 20 ? 0 : (page - 1) * limit;

        const sqlData = `
             SELECT 
                C.Key,
                C.Name,
                C.Capacity,
                C.Start_Time,
                C.End_Time, 
                C.Status,
                C.Cost, 
                C.Days,
                C.Time_Deleted,
                C.Date_Created,
                C.Instructor_ID,
                I.Name as Instructor_Name,
                (SELECT COUNT(*) FROM Student S WHERE S.Id_curs = C.Key AND S.Time_Deleted IS NULL) AS Total_Students
            FROM Course C
            LEFT JOIN Instructor I ON C.Instructor_ID = I.Key
            WHERE C.Time_Deleted IS NOT NULL 
            ORDER BY C.Time_Deleted DESC 
            LIMIT ? OFFSET ?`;


        const data = await DB.buscarTodo(sqlData, [finalLimit, offset]);
        return formatResponse(true, data, totalElements, page, finalLimit);
    } catch (error) {
        return { success: false, message: "Error al obtener papelera de cursos." };
    }
}

// --- ESTUDIANTES EN PAPELERA ---
async function GetStudentPagedTrash(page = 1, limit = 10) {
    try {
        await DB.conectar();
        const sqlCount = `SELECT COUNT(*) as total FROM Student WHERE Time_Deleted IS NOT NULL`;
        const resCount = await DB.buscar(sqlCount);
        const totalElements = resCount?.total ?? 0;

        let finalLimit = totalElements <= 20 ? 20 : limit;
        let offset = totalElements <= 20 ? 0 : (page - 1) * limit;

        const sqlData = `
            SELECT 
                S.Key, 
                S.Name,
                S.Cod_id,
                S.Tlf,
                S.E_mail,
                S.Date, 
                S.Time,
                S.Id_curs,
            S.Time_Deleted, 
            C.Name as CourseName
            FROM Student S
            LEFT JOIN Course C ON S.Id_curs = C.Key
            WHERE S.Time_Deleted IS NOT NULL 
            ORDER BY S.Time_Deleted DESC 
            LIMIT ? OFFSET ?`;

        const data = await DB.buscarTodo(sqlData, [finalLimit, offset]);
        return formatResponse(true, data, totalElements, page, finalLimit);
    } catch (error) {
        return { success: false, message: "Error al obtener papelera de estudiantes." };
    }
}

// --- EMPLEADOS EN PAPELERA ---
async function GetEmployeesPagedTrash(page = 1, limit = 10) {
    try {
        await DB.conectar();
        const sqlCount = `SELECT COUNT(*) as total FROM Employee WHERE Time_Deleted IS NOT NULL`;
        const resCount = await DB.buscar(sqlCount);
        const totalElements = resCount?.total ?? 0;

        let finalLimit = totalElements <= 20 ? 20 : limit;
        let offset = totalElements <= 20 ? 0 : (page - 1) * limit;

        const sqlData = `
            SELECT Key, Name, E_mail, Tlf, Status, Date, Time_Deleted
            FROM Employee 
            WHERE Time_Deleted IS NOT NULL 
            ORDER BY Time_Deleted DESC 
            LIMIT ? OFFSET ?`;

        const data = await DB.buscarTodo(sqlData, [finalLimit, offset]);
        return formatResponse(true, data, totalElements, page, finalLimit);
    } catch (error) {
        return { success: false, message: "Error al obtener papelera de empleados." };
    }
}

// --- INSTRUCTORES EN PAPELERA ---
async function GetInstructorsPagedTrash(page = 1, limit = 10) {
    try {
        await DB.conectar();
        const sqlCount = `SELECT COUNT(*) as total FROM Instructor WHERE Time_Deleted IS NOT NULL`;
        const resCount = await DB.buscar(sqlCount);
        const totalElements = resCount?.total ?? 0;

        let finalLimit = totalElements <= 20 ? 20 : limit;
        let offset = totalElements <= 20 ? 0 : (page - 1) * limit;

        const sqlData = `
            SELECT 
            Key, 
            Name,
            Specialty,
            Tlf,
            Status,
            Date,
            Time_Deleted
            FROM Instructor 
            WHERE Time_Deleted IS NOT NULL 
            ORDER BY Time_Deleted DESC 
            LIMIT ? OFFSET ?`;

        const data = await DB.buscarTodo(sqlData, [finalLimit, offset]);
        return formatResponse(true, data, totalElements, page, finalLimit);
    } catch (error) {
        return { success: false, message: "Error al obtener papelera de instructores." };
    }
}

// Función auxiliar para no repetir código de respuesta
function formatResponse(success, data, total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    return {
        success,
        data: data || [],
        pagination: {
            totalElements: total,
            totalPages: totalPages || 0,
            currentPage: total <= 20 ? 1 : page,
            limit,
            isPaged: total > 20
        }
    };
}

/*------------------------------------------------------------------------------*/
async function GetTrashItemByKey(tableName, key) {
    try {
        await DB.conectar();

        // 1. Diccionario de consultas para incluir información relacionada (JOINs)
        const queries = {
            'User': `SELECT * FROM User WHERE Key = ? AND Time_Deleted IS NOT NULL`,
            
            'Employee': `SELECT E.*, U.Username 
                         FROM Employee E 
                         LEFT JOIN User U ON E.Id_user = U.Key 
                         WHERE E.Key = ? AND E.Time_Deleted IS NOT NULL`,
            
            'Instructor': `SELECT * FROM Instructor WHERE Key = ? AND Time_Deleted IS NOT NULL`,
            
            'Student': `SELECT S.*, C.Name as CourseName 
                        FROM Student S 
                        LEFT JOIN Course C ON S.Id_curs = C.Key 
                        WHERE S.Key = ? AND S.Time_Deleted IS NOT NULL`,
            
            'Course': `SELECT C.*, I.Name as InstructorName 
                       FROM Course C 
                       LEFT JOIN Instructor I ON C.Instructor_ID = I.Key 
                       WHERE C.Key = ? AND C.Time_Deleted IS NOT NULL`
        };

        const sql = queries[tableName];

        if (!sql) {
            return { success: false, message: "Tabla no válida o no encontrada." };
        }

        // 2. Ejecutar la búsqueda
        const result = await DB.buscar(sql, [key]);

        // En SQLite, si no hay resultados, result suele ser undefined o null
        if (!result) {
            return { 
                success: false, 
                message: `No se encontró el registro en la papelera de ${tableName}.` 
            };
        }

        return {
            success: true,
            data: result
        };

    } catch (error) {
        console.error("Error en GetTrashItemByKey:", error);
        return { success: false, message: "Error interno al buscar el elemento." };
    }
}


async function GlobalSearchTrash(tableName, searchValue) {
    try {
        await DB.conectar();

        const tableColumns = {
            'User': ['Username', 'Permission', 'Date'],
            'Employee': ['Name', 'Cod_id', 'E_mail', 'Tlf', 'Address'],
            'Instructor': ['Name', 'Cod_id', 'E_mail', 'Specialty'],
            'Student': ['Name', 'Cod_id', 'E_mail', 'Tlf'],
            'Course': ['Name', 'Description', 'Days', 'Status']
        };

        const columns = tableColumns[tableName];
        if (!columns) return { success: false, message: "Tabla no válida." };

        let sql = "";
        // IMPORTANTE: Seleccionamos explícitamente los campos para evitar ambigüedad
        if (tableName === 'Student') {
            sql = `SELECT S.*, C.Name as CourseName FROM Student S LEFT JOIN Course C ON S.Id_curs = C.Key`;
        } else if (tableName === 'Course') {
            sql = `SELECT C.*, I.Name as InstructorName FROM Course C LEFT JOIN Instructor I ON C.Instructor_ID = I.Key`;
        } else if (tableName === 'Employee') {
            sql = `SELECT E.*, U.Username FROM Employee E LEFT JOIN User U ON E.Id_user = U.Key`;
        } else {
            sql = `SELECT * FROM ${tableName}`;
        }

        // Usamos un alias consistente o el nombre de la tabla directamente
        let tableAlias = (tableName === 'Student') ? 'S' : 
                         (tableName === 'Course') ? 'C' : 
                         (tableName === 'Employee') ? 'E' : tableName;

        // Cambiamos el WHERE para que use el ALIAS si existe
        let whereClause = ` WHERE ${tableAlias}.Time_Deleted IS NOT NULL`;
        let params = [];

        if (searchValue) {
            whereClause += " AND (";
            const orConditions = columns.map(col => {
                params.push(`%${searchValue}%`);
                return `${tableAlias}.${col} LIKE ?`;
            });
            whereClause += orConditions.join(" OR ") + ")";
        }

        sql += whereClause + ` ORDER BY ${tableAlias}.Time_Deleted DESC`;

        const results = await DB.buscarTodo(sql, params);

        return {
            table:tableName,
            success: true,
            count: results.length,
            data: results,
            pagination: {
                isPaged:false
             }
        };

    } catch (error) {
        // Esto te dirá exactamente qué falló en la consola
        console.error("Detalle del error SQL:", error.message);
        return { success: false, message: "Error: " + error.message };
    }
}
module.exports = {
    GetCoursePagedTrash:GetCoursePagedTrash,
    GetStudentPagedTrash:GetStudentPagedTrash,
    GetEmployeesPagedTrash:GetEmployeesPagedTrash,
    GetInstructorsPagedTrash:GetInstructorsPagedTrash,
    GetTrashItemByKey:GetTrashItemByKey,
    GlobalSearchTrash:GlobalSearchTrash

}

