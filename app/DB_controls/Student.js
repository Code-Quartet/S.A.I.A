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

async function GetListDataCourseStudent() {
    try {
        await DB.conectar();

        const sql = `
            SELECT 
                c.Key, 
                c.Name, 
                c.Capacity,
                COUNT(s.Key) as Total_Inscritos
            FROM Course c
            LEFT JOIN Student s ON c.Key = s.Id_curs AND s.Time_Deleted IS NULL
            WHERE c.Status = 'Activo' 
              AND c.Time_Deleted IS NULL
            GROUP BY c.Key, c.Name, c.Capacity
            HAVING Total_Inscritos < c.Capacity
        `;

        const results = await DB.buscarTodo(sql);

        console.log(results)

        return {
            success: true,
            data: results
        };

    } catch (error) {
        console.error("Error al obtener cursos con cupo:", error);
        return {
            success: false,
            message: "No se pudieron cargar los cursos disponibles.",
            data: []
        };
    }
}

async function GetStudentPaged(page = 1, limit = 10) {
    try {
        // 1. Obtener el total de estudiantes activos
        // Corrección: La tabla se llama 'Student', no 'Studient'
        const sqlCount = `SELECT COUNT(*) as total FROM Student WHERE Time_Deleted IS NULL`;
        const resCount = await DB.buscar(sqlCount); // Asegúrate de usar 'DB' en mayúsculas si así está definido
        
        const totalElements = resCount?.total ?? 0;

        // 2. Lógica adaptativa
        let finalLimit = limit;
        let offset = (page - 1) * limit;

        if (totalElements <= 20) {
            finalLimit = 20; // O totalElements
            offset = 0;
        }

        const sqlData = `
            SELECT 
                S.Key, S.Name, S.Cod_id, S.Tlf, S.E_mail,
                S.Date_Created, S.Time_Created, S.Id_curs,
                C.Name as CourseName
            FROM Student S
            LEFT JOIN Course C ON S.Id_curs = C.Key
            WHERE S.Time_Deleted IS NULL 
            ORDER BY S.Date_Created DESC, S.Time_Created DESC
            LIMIT ? OFFSET ?`;


        const students = await DB.buscarTodo(sqlData, [finalLimit, offset]);

        // 4. Calcular total de páginas
        const totalPages = totalElements <= 20 ? 1 : Math.ceil(totalElements / limit);

        if (!students || students.length === 0) {
            return {
                success: false,
                message: `No se encontraron estudiantes`,
                pagination: {
                    totalElements,
                    totalPages,
                    currentPage: page,
                    limit: finalLimit,
                    isPaged: totalElements > 20
                }
            };
        }

        return {
            success: true,
            data: students,
            pagination: {
                totalElements,
                totalPages,
                currentPage: totalElements <= 20 ? 1 : page,
                limit: finalLimit,
                isPaged: totalElements > 20
            }
        };

    } catch (error) {
        console.error("Error en GetStudentPaged:", error);
        return { 
            success: false, 
            message: "Error al obtener la lista de estudiantes." 
        };
    }
}

async function SearchStudentPagedName(searchTerm) {
    try {
        const termClean = searchTerm ? searchTerm.trim() : "";

        if (!termClean) {
            return { success: false, message: "Debe ingresar un nombre o código." };
        }

            // 1. Consulta sin LIMIT ni OFFSET
        const sqlData = `
            SELECT 
                S.Key, S.Name, S.Cod_id, S.Tlf, S.E_mail, 
                S.Date_Created, S.Time_Created, S.Id_curs, 
                C.Name as CourseName
            FROM Student S
            LEFT JOIN Course C ON S.Id_curs = C.Key
            WHERE S.Time_Deleted IS NULL 
              AND (S.Name LIKE ? OR S.Cod_id LIKE ?)
            ORDER BY S.Date_Created DESC, S.Time_Created DESC`;
        const search = `%${termClean}%`;

        // 2. Pasamos solo los 2 parámetros de búsqueda
        const students = await DB.buscarTodo(sqlData, [search, search]);

        if (!students || students.length === 0) {
            return {
                success: false,
                message: `No se encontraron coincidencias para: ${termClean}`,
            };
        }

        return {
            success: true,
            data:students, // Retorna el array directo de resultados
        };

    } catch (error) {
        console.error("Error en SearchStudentPaged:", error);
        return { 
            success: false, 
            message: "Error al realizar la búsqueda de estudiantes." 
        };
    }
}

async function SearchStudentPagedData(searchTerm) {
    try {
        const termClean = searchTerm ? searchTerm.trim() : "";

        if (!termClean) {
            return { success: false, message: "Debe ingresar un nombre o código." };
        }

        const sqlData = `
            SELECT 
                S.Key, S.Name, S.Cod_id, S.Tlf, S.E_mail, 
                S.Date_Created, S.Time_Created, S.Id_curs, 
                C.Name as CourseName
            FROM Student S
            LEFT JOIN Course C ON S.Id_curs = C.Key
            WHERE S.Time_Deleted IS NULL 
              AND (S.Date_Created LIKE ? OR S.Cod_id LIKE ?)
            ORDER BY S.Date_Created DESC, S.Time_Created DESC`;
        const search = `%${termClean}%`;

        // 2. Pasamos solo los 2 parámetros de búsqueda
        const students = await DB.buscarTodo(sqlData, [search, search]);

        if (!students || students.length === 0) {
            return {
                success: false,
                message: `No se encontraron coincidencias para: ${termClean}`,
            };
        }

        return {
            success: true,
            data:students, // Retorna el array directo de resultados
        };

    } catch (error) {
        console.error("Error en SearchStudentPaged:", error);
        return { 
            success: false, 
            message: "Error al realizar la búsqueda de estudiantes." 
        };
    }
}

async function GetdataStudent(key){
        const sql = `
            SELECT S.*, C.Name as CourseName
            FROM Student S
            LEFT JOIN Course C ON S.Id_curs = C.Key
            WHERE S.Time_Deleted IS NULL 
              AND S.Key = ?`;
    let result = await DB.buscar(sql,[key])
    return result;

}

async function RegisterStudent(data) {
    const key = uuidv4();
 const sql = `
    INSERT INTO Student (
        Key, Id_curs, Name, Cod_id, Address, Tlf, E_mail, Image, Age, Birthdate,
        Name_Representative, Cod_id_Representative, Tlf_Representative, E_mail_Representative,
        Date_Created, Time_Created
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, date('now'), time('now'))`;

    
    const est = data.estudiante || {};
    const rep = data.representante || {}; 

    const params = [
        key, est.curso || null, est.nombre || null, est.cedula || null, est.direccion || null,
        est.telefono || null, est.correo || null, est.imagen || null, est.edad || null,
        est.nacimiento || null, rep.nombre || null, rep.cedula || null, rep.telefono || null, rep.correo || null
    ];

    try {
        return await DB.crear(sql, params);
    } catch (error) {
        console.error("Error al registrar:", error);
        throw error;
    }
}

async function UpdateStudent(key, data) {
    const sql = `
        UPDATE Student SET 
            Id_curs = ?, 
            Name = ?, 
            Cod_id = ?, 
            Address = ?, 
            Tlf = ?, 
            E_mail = ?,
            Image = ?, 
            Age = ?, 
            Birthdate = ?, 
            Name_Representative = ?, 
            Cod_id_Representative = ?, 
            Tlf_Representative = ?, 
            E_mail_Representative = ?
        WHERE Key = ?`;

    const est = data.estudiante || {};
    const rep = data.representante || {}; 

    const params = [
        est.curso || null, est.nombre || null, est.cedula || null, est.direccion || null,
        est.telefono || null, est.correo || null, est.imagen || null, est.edad || null,
        est.nacimiento || null, rep.nombre || null, rep.cedula || null, rep.telefono || null,
        rep.correo || null, key
    ];

    return await DB.actualizar(sql, params); 
}

async function DeleteStudentLogical(key) {
    const sql = `UPDATE Student SET Time_Deleted = date('now') WHERE Key = ?`;
    return await DB.borrar(sql, [key]);
}


/*---------------------------------------------------------*/
module.exports={
    GetdataStudent:GetdataStudent,
    GetStudentPaged:GetStudentPaged,
    GetListDataCourseStudent:GetListDataCourseStudent,
    SearchStudentPagedName:SearchStudentPagedName,
    SearchStudentPagedData:SearchStudentPagedData,
    RegisterStudent:RegisterStudent,
    UpdateStudent:UpdateStudent,
    DeleteStudentLogical:DeleteStudentLogical
}