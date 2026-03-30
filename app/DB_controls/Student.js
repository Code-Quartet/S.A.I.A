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
            GROUP BY c.Key
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

        // 3. Consulta de datos
        // Corrección: Se eliminó la coma extra después de S.Id_curs
        // Corrección: Tabla 'Student' y 'Curso' (según tu definición de CREATE TABLE)
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
                C.Name as CourseName -- Ejemplo de cómo traer el nombre del curso
            FROM Student S
            LEFT JOIN Course C ON S.Id_curs = C.Key
            WHERE S.Time_Deleted IS NULL
            ORDER BY S.Date DESC, S.Time DESC
            LIMIT ? OFFSET ?`;

  /*
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
                C.Name as CourseName -- Ejemplo de cómo traer el nombre del curso
            FROM Student S
            LEFT JOIN Course C ON S.Id_curs = C.Key
            WHERE S.Time_Deleted IS NULL 
            ORDER BY S.Name ASC 
            LIMIT ? OFFSET ?`;*/
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
                S.Key, 
                S.Name,
                S.Cod_id,
                S.Tlf,
                S.E_mail,
                S.Date, 
                S.Time,
                S.Id_curs,
                C.Name as CourseName
            FROM Student S
            LEFT JOIN Course C ON S.Id_curs = C.Key
            WHERE S.Time_Deleted IS NULL 
            AND (S.Name LIKE ? OR S.Cod_id LIKE ?)`;

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

        // 1. Consulta sin LIMIT ni OFFSET
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
                C.Name as CourseName
            FROM Student S
            LEFT JOIN Course C ON S.Id_curs = C.Key
            WHERE S.Time_Deleted IS NULL 
            AND (S.Date LIKE ? OR S.Cod_id LIKE ?)`;

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
            SELECT 
                S.Key, 
                S.Name, 
                S.Cod_id, 
                S.Address, 
                S.Tlf, 
                S.E_mail,
                S.Image,
                S.Age,
                S.Birthdate,
                S.Name_Representative, 
                S.Cod_id_Representative,
                S.Tlf_Representative, 
                S.E_mail_Representative,
                S.Date,
                S.Time,
                S.Id_curs,
                C.Name as CourseName
            FROM Student S
            LEFT JOIN Course C ON S.Id_curs = C.Key
            WHERE S.Time_Deleted IS NULL 
            AND S.Key= ?`;

    //let sql = `SELECT * FROM Student WHERE Key=?`;
    let result = await DB.buscar(sql,[key])
    return result;
   // console.log(result);
}

async function RegisterStudent(data) {
    // Generamos la llave única
    const key = uuidv4();
    
    // 1. Definimos el SQL (Usando "Key" entre comillas por ser palabra reservada)
    const sql = `
        INSERT INTO Student (
            Key, 
            Id_curs, 
            Name, 
            Cod_id, 
            Address, 
            Tlf, 
            E_mail,
            Image,
            Age,
            Birthdate,
            Name_Representative, 
            Cod_id_Representative,
            Tlf_Representative, 
            E_mail_Representative,
            Date,
            Time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, date('now'), time('now'))`;

    // 2. Extraemos los datos con seguridad
    // Usamos el operador ?. (optional chaining) para evitar errores si 'estudiante' no existe
    const est = data.estudiante || {};
    const rep = data.representante || {}; 

    // 3. Construimos los parámetros (exactamente 14 placeholders)
    const params = [
        key,                         // "Key"
        est.curso || null,           // Id_curs
        est.nombre || null,          // Name
        est.cedula || null,          // Cod_id
        est.direccion || null,       // Address
        est.telefono || null,        // Tlf
        est.correo || null,          // E_mail
        est.imagen || null,          // Image
        est.edad || null,            // Age
        est.nacimiento || null,      // Birthdate
        rep.nombre || null,          // Name_Representative
        rep.cedula || null,          // Cod_id_Representative
        rep.telefono || null,        // Tlf_Representative
        rep.correo || null           // E_mail_Representative
    ];

    // 4. Ejecutamos la consulta
    try {
        return await DB.crear(sql, params);
    } catch (error) {
        console.error("Error al registrar estudiante:", error);
        throw error;
    }
}

async function UpdateStudent(key, data) {

        /*----------------------------*/
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

            // 3. Construimos los parámetros (exactamente 14 placeholders)
            const params = [

                est.curso || null,           // Id_curs
                est.nombre || null,          // Name
                est.cedula || null,          // Cod_id
                est.direccion || null,       // Address
                est.telefono || null,        // Tlf
                est.correo || null,          // E_mail
                est.imagen || null,          // Image
                est.edad || null,            // Age
                est.nacimiento || null,      // Birthdate
                rep.nombre || null,          // Name_Representative
                rep.cedula || null,          // Cod_id_Representative
                rep.telefono || null,        // Tlf_Representative
                rep.correo || null,           // E_mail_Representative
                key,                         // "Key"
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