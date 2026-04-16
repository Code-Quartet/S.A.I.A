const path = require('path');
const fs = require('fs');
const os_system = require('os');
const { v4: uuidv4 } = require('uuid');

/*-------------------------------------*/
const SAIADB = require(path.join(__dirname, '../../src/database_controls/SAIA_manager.js'));
const DB = new SAIADB(path.join(__dirname, '../../database/SAIA.db'));
/*------------------------------------------*/

/* --- FUNCIÓN AUXILIAR DE RESPUESTA --- */
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

/* --- CURSOS EN PAPELERA --- */
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
                C.Key, C.Name, C.Capacity, C.Start_Time, C.End_Time, 
                C.Status, C.Cost, C.Days, C.Time_Deleted, C.Date_Created, C.Instructor_ID,
                I.Name as Instructor_Name,
                (SELECT COUNT(*) FROM Student_Courses SC WHERE SC.Id_curs = C.Key) AS Total_Students
            FROM Course C
            LEFT JOIN Instructor I ON C.Instructor_ID = I.Key
            WHERE C.Time_Deleted IS NOT NULL 
            ORDER BY C.Time_Deleted DESC 
            LIMIT ? OFFSET ?`;

        const data = await DB.buscarTodo(sqlData, [finalLimit, offset]);
        return formatResponse(true, data, totalElements, page, finalLimit);
    } catch (error) {
        console.error(error);
        return { success: false, message: "Error al obtener papelera de cursos." };
    }
}

/* --- ESTUDIANTES EN PAPELERA --- */
async function GetStudentPagedTrash(page = 1, limit = 10) {
    try {
        await DB.conectar();
        const sqlCount = `SELECT COUNT(*) as total FROM Student WHERE Time_Deleted IS NOT NULL`;
        const resCount = await DB.buscar(sqlCount);
        const totalElements = resCount?.total ?? 0;

        let finalLimit = totalElements <= 20 ? 20 : limit;
        let offset = totalElements <= 20 ? 0 : (page - 1) * limit;

        const sqlData = `
            SELECT S.Key, S.Name, S.Cod_id, S.Tlf, S.E_mail, S.Date_Created, 
                   S.Time_Created, S.Time_Deleted,
                   (SELECT GROUP_CONCAT(C.Name, ', ') 
                    FROM Student_Courses SC 
                    JOIN Course C ON SC.Id_curs = C.Key 
                    WHERE SC.Id_student_key = S.Key) as CourseNames
            FROM Student S
            WHERE S.Time_Deleted IS NOT NULL 
            ORDER BY S.Time_Deleted DESC 
            LIMIT ? OFFSET ?`;

        const data = await DB.buscarTodo(sqlData, [finalLimit, offset]);
        return formatResponse(true, data, totalElements, page, finalLimit);
    } catch (error) {
        return { success: false, message: "Error al obtener papelera de estudiantes." };
    }
}

/* --- EMPLEADOS EN PAPELERA --- */
async function GetEmployeesPagedTrash(page = 1, limit = 10) {
    try {
        await DB.conectar();
        const sqlCount = `SELECT COUNT(*) as total FROM Employee WHERE Time_Deleted IS NOT NULL`;
        const resCount = await DB.buscar(sqlCount);
        const totalElements = resCount?.total ?? 0;

        let finalLimit = totalElements <= 20 ? 20 : limit;
        let offset = totalElements <= 20 ? 0 : (page - 1) * limit;

        const sqlData = `
            SELECT Key, Name, Cod_id, E_mail, Tlf, Status, Date_Created, Time_Deleted
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

/* --- INSTRUCTORES EN PAPELERA --- */
async function GetInstructorsPagedTrash(page = 1, limit = 10) {
    try {
        await DB.conectar();
        const sqlCount = `SELECT COUNT(*) as total FROM Instructor WHERE Time_Deleted IS NOT NULL`;
        const resCount = await DB.buscar(sqlCount);
        const totalElements = resCount?.total ?? 0;

        let finalLimit = totalElements <= 20 ? 20 : limit;
        let offset = totalElements <= 20 ? 0 : (page - 1) * limit;

        const sqlData = `
            SELECT Key, Name, Cod_id, Specialty, Tlf, Status, Date_Created, Time_Deleted
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

/* --- OBTENER ÍTEM POR LLAVE --- */
async function GetTrashItemByKey(tableName, key) {
    try {
        await DB.conectar();
        const queries = {
            'User': `SELECT * FROM User WHERE Key = ? AND Time_Deleted IS NOT NULL`,
            'Employee': `SELECT E.*, U.Username FROM Employee E LEFT JOIN User U ON E.Id_user = U.Key WHERE E.Key = ? AND E.Time_Deleted IS NOT NULL`,
            'Instructor': `SELECT * FROM Instructor WHERE Key = ? AND Time_Deleted IS NOT NULL`,
            'Student': `SELECT S.* FROM Student S WHERE S.Key = ? AND S.Time_Deleted IS NOT NULL`,
            'Course': `SELECT C.*, I.Name as InstructorName FROM Course C LEFT JOIN Instructor I ON C.Instructor_ID = I.Key WHERE C.Key = ? AND C.Time_Deleted IS NOT NULL`
        };

        const sql = queries[tableName];
        if (!sql) return { success: false, message: "Tabla no válida." };

        const result = await DB.buscar(sql, [key]);
        if (!result) return { success: false, message: `No se encontró el registro en ${tableName}.` };

        // Caso especial para estudiantes: obtener sus cursos actuales si existen
        if (tableName === 'Student') {
            const courses = await DB.buscarTodo(`SELECT C.Name FROM Student_Courses SC JOIN Course C ON SC.Id_curs = C.Key WHERE SC.Id_student_key = ?`, [key]);
            result.Courses = courses.map(c => c.Name).join(", ");
        }

        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Error interno al buscar el elemento." };
    }
}

/* --- BÚSQUEDA GLOBAL EN PAPELERA --- */
async function GlobalSearchTrash(tableName, searchValue) {
    try {
        await DB.conectar();

        // 1. Mapeo de columnas para búsqueda (Consistente con GlobalSearch)
        const tableColumns = {
            'Employee': ['Key', 'Name', 'E_mail', 'Tlf', 'Status', 'Cod_id'],
            'Instructor': ['Key', 'Name', 'Cod_id', 'Specialty', 'Tlf', 'Status'],
            'Student': ['Key', 'Name', 'Cod_id', 'Tlf', 'E_mail', 'Date_Created', 'Time_Created'],
            'Course': ['Name', 'Description', 'Days', 'Status'],
            'User': ['Username', 'Permission']
        };

        const columns = tableColumns[tableName];
        if (!columns) return { success: false, message: "Tabla no válida." };

        let sql = "";
        let tableAlias = "";
        let groupBy = "";
        let orderBy = "";

        // 2. Definición de Base SQL (Misma estructura de datos que GlobalSearch)
        if (tableName === 'Student') {
            tableAlias = "S";
            // Extrae nombres de cursos desde la tabla intermedia Student_Courses
            sql = `
                SELECT S.*, GROUP_CONCAT(C.Name, ', ') as CourseNames 
                FROM Student S 
                LEFT JOIN Student_Courses SC ON S.Key = SC.Id_student_key 
                LEFT JOIN Course C ON SC.Id_curs = C.Key`;
            groupBy = " GROUP BY S.Key";
            orderBy = " ORDER BY S.Time_Deleted DESC"; 
        } else if (tableName === 'Course') {
            tableAlias = "C";
            // Extrae nombre de instructor y cuenta estudiantes inscritos
            sql = `
                SELECT C.*, I.Name as Instructor_Name,
                (SELECT COUNT(*) FROM Student_Courses SC WHERE SC.Id_curs = C.Key) AS Total_Students
                FROM Course C 
                LEFT JOIN Instructor I ON C.Instructor_ID = I.Key`;
            orderBy = " ORDER BY C.Time_Deleted DESC";
        } else if (tableName === 'Employee') {
            tableAlias = "E";
            sql = `SELECT E.*, U.Username FROM Employee E LEFT JOIN User U ON E.Id_user = U.Key`;
            orderBy = " ORDER BY E.Time_Deleted DESC";
        } else if (tableName === 'Instructor') {
            tableAlias = "I";
            sql = `SELECT I.* FROM Instructor I`;
            orderBy = " ORDER BY I.Time_Deleted DESC";
        } else if (tableName === 'User') {
            tableAlias = "U";
            sql = `SELECT U.* FROM User U`;
            orderBy = " ORDER BY U.Time_Deleted DESC";
        } else {
            tableAlias = "T";
            sql = `SELECT T.* FROM ${tableName} T`;
            orderBy = " ORDER BY T.Time_Deleted DESC";
        }

        // 3. Construir WHERE para la PAPELERA (Time_Deleted IS NOT NULL)
        let whereClause = ` WHERE ${tableAlias}.Time_Deleted IS NOT NULL`;
        let params = [];

        if (searchValue) {
            const term = `%${searchValue}%`;
            whereClause += " AND (";
            const orConditions = columns.map(col => {
                params.push(term);
                return `${tableAlias}.${col} LIKE ?`;
            });
            whereClause += orConditions.join(" OR ") + ")";
        }

        // 4. Ejecución final
        const finalSql = sql + whereClause + groupBy + orderBy;
        const results = await DB.buscarTodo(finalSql, params);

        return {
            table: tableName,
            success: true,
            count: results.length,
            data: results,
            pagination: { isPaged: false }
        };

    } catch (error) {
        console.error("Detalle del error SQL en GlobalSearchTrash:", error.message);
        return { success: false, message: "Error en búsqueda de papelera: " + error.message };
    }
}
module.exports = {
    GetCoursePagedTrash,
    GetStudentPagedTrash,
    GetEmployeesPagedTrash,
    GetInstructorsPagedTrash,
    GetTrashItemByKey,
    GlobalSearchTrash
};