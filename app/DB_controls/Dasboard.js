const path = require('path')
const fs = require('fs')
const os_system = require('os')
const { v4: uuidv4 } = require('uuid');
/*-------------------------------------*/
const SAIADB = require(path.join(__dirname,'../DataBase/SAIA_manager.js'))
const DB = new SAIADB(path.join(__dirname,'../DataBase/SAIA.db'));
/*--------------LINK BASE DE DATOS ------------------------*/


async function GetDashboardStats() {
    try {
        await DB.conectar();

        // 1. Estadísticas de CURSOS (Total, Cupos y Status)
        const courseStats = await DB.buscarTodo(`
            SELECT 
                COUNT(*) as total,
                SUM(CAST(Capacity AS INTEGER)) as total_capacity,
                SUM(CASE WHEN Status = 'Activo' THEN 1 ELSE 0 END) as activos,
                SUM(CASE WHEN Status = 'Pausa' THEN 1 ELSE 0 END) as pausa,
                SUM(CASE WHEN Status = 'Cancelado' THEN 1 ELSE 0 END) as cancelados,
                SUM(CASE WHEN Status = 'Completado' THEN 1 ELSE 0 END) as completados
            FROM Course 
            WHERE Time_Deleted IS NULL
        `);

        // 2. Estadísticas de INSTRUCTORES (Total y Status)
        const instructorStats = await DB.buscarTodo(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN Status = 'Activo' THEN 1 ELSE 0 END) as activos,
                SUM(CASE WHEN Status = 'Inactivo' THEN 1 ELSE 0 END) as inactivos,
                SUM(CASE WHEN Status = 'Despedido' THEN 1 ELSE 0 END) as despedidos
            FROM Instructor 
            WHERE Time_Deleted IS NULL
        `);

        // 3. Estadísticas de EMPLEADOS (Total y Status)
        const employeeStats = await DB.buscarTodo(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN Status = 'Activo' THEN 1 ELSE 0 END) as activos,
                SUM(CASE WHEN Status = 'Inactivo' THEN 1 ELSE 0 END) as inactivos,
                SUM(CASE WHEN Status = 'Despedido' THEN 1 ELSE 0 END) as despedidos
            FROM Employee 
            WHERE Time_Deleted IS NULL
        `);

        // 4. Estadísticas de ESTUDIANTES (Total)
        const studentStats = await DB.buscar(`
            SELECT COUNT(*) as total 
            FROM Student 
            WHERE Time_Deleted IS NULL
        `);

        // Estructura de respuesta organizada
        return {
            success: true,
            data: {
                courses: {
                    total: courseStats[0].total || 0,
                    capacity: courseStats[0].total_capacity || 0,
                    byStatus: {
                        activo: courseStats[0].activos || 0,
                        pausa: courseStats[0].pausa || 0,
                        cancelado: courseStats[0].cancelados || 0,
                        completado: courseStats[0].completados || 0
                    }
                },
                instructors: {
                    total: instructorStats[0].total || 0,
                    byStatus: {
                        activo: instructorStats[0].activos || 0,
                        inactivo: instructorStats[0].inactivos || 0,
                        despedido: instructorStats[0].despedidos || 0
                    }
                },
                employees: {
                    total: employeeStats[0].total || 0,
                    byStatus: {
                        activo: employeeStats[0].activos || 0,
                        inactivo: employeeStats[0].inactivos || 0,
                        despedido: employeeStats[0].despedidos || 0
                    }
                },
                students: {
                    total: studentStats.total || 0
                }
            }
        };

    } catch (error) {
        console.error("Error al obtener estadísticas:", error);
        return {
            success: false,
            message: "Error al procesar el resumen de datos."
        };
    }
}

async function GlobalSearch(tableName, searchValue) {
    try {
        await DB.conectar();

        // 1. Mapeo de columnas por tabla
        const tableColumns = {
            'Employee': ['Key', 'Name', 'E_mail', 'Tlf', 'Status', 'Cod_id'],
            'Instructor': ['Key', 'Name', 'Cod_id', 'Specialty', 'Tlf', 'Status'],
            'Student': ['Key', 'Name', 'Cod_id', 'Tlf', 'E_mail', 'Date_Created', 'Time_Created', 'Id_curs'],
            'Course': ['Name', 'Description', 'Days', 'Status']
        };

        const columns = tableColumns[tableName];
        if (!columns) return { success: false, message: "Tabla no válida." };

        // 2. Definir Alias y Base SQL
        let sql = "";
        let tableAlias = "";
        let orderBy = "";

        // Ajustamos el SQL y el OrderBy según la tabla (usando nombres de columnas reales)
        if (tableName === 'Student') {
            tableAlias = "S";
            sql = `SELECT S.*, C.Name as CourseName FROM Student S LEFT JOIN Course C ON S.Id_curs = C.Key`;
            orderBy = ` ORDER BY S.Date_Created DESC, S.Time_Created DESC`;
        } else if (tableName === 'Course') {
            tableAlias = "C";
            sql = `SELECT C.*, I.Name as InstructorName FROM Course C LEFT JOIN Instructor I ON C.Instructor_ID = I.Key`;
            orderBy = ` ORDER BY C.Name ASC`; // Course usualmente no tiene Date_Created, o ajusta según tu DB
        } else if (tableName === 'Employee') {
            tableAlias = "E";
            sql = `SELECT E.*, U.Username FROM Employee E LEFT JOIN User U ON E.Id_user = U.Key`;
            orderBy = ` ORDER BY E.Date_Created DESC, E.Time_Created DESC`;
        } else if (tableName === 'Instructor') {
            tableAlias = "I";
            sql = `SELECT * FROM Instructor I`;
            orderBy = ` ORDER BY I.Name ASC`;
        } else {
            tableAlias = tableName;
            sql = `SELECT * FROM ${tableName}`;
            orderBy = ""; 
        }

        // 3. Construir WHERE
        let whereClause = ` WHERE ${tableAlias}.Time_Deleted IS NULL`;
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

        // 4. Ejecución
        const finalSql = sql + whereClause + orderBy;
        const results = await DB.buscarTodo(finalSql, params);

        return {
            table: tableName,
            success: true,
            count: results.length,
            data: results,
            pagination: { isPaged: false }
        };

    } catch (error) {
        console.error("Detalle del error SQL:", error.message);
        return { success: false, message: "Error en búsqueda global: " + error.message };
    }
}

module.exports={GetDashboardStats:GetDashboardStats,GlobalSearch:GlobalSearch}