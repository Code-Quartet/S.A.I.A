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
        const sql = `
            SELECT 
                c.Key, 
                c.Name, 
                c.Capacity,
                COUNT(sc.Id_student_key) as Total_Inscritos
            FROM Course c
            LEFT JOIN Student_Courses sc ON c.Key = sc.Id_curs
            WHERE c.Status = 'Activo' 
              AND c.Time_Deleted IS NULL
            GROUP BY c.Key, c.Name, c.Capacity
            HAVING Total_Inscritos < c.Capacity
        `;

        const results = await DB.buscarTodo(sql);
        return { success: true, data: results };
    } catch (error) {
        console.error("Error al obtener cursos con cupo:", error);
        return { success: false, message: "No se pudieron cargar los cursos disponibles.", data: [] };
    }
}

async function GetStudentPaged(page = 1, limit = 10) {
    try {
        await DB.conectar();

        // 1. Obtener el total de estudiantes activos
        const sqlCount = `SELECT COUNT(*) as total FROM Student WHERE Time_Deleted IS NULL`;
        const resCount = await DB.buscar(sqlCount);
        const totalElements = resCount?.total ?? 0;

        // 2. Lógica adaptativa de paginación
        let finalLimit = limit;
        let finalOffset = (page - 1) * limit;
        let finalPage = page;

        if (totalElements <= 20) {
            finalLimit = 20; 
            finalOffset = 0;
            finalPage = 1;
        }

        // 3. Consultar datos con relación N:N y agrupamiento de nombres de cursos
        const sqlData = `
            SELECT 
                S.Key, S.Name, S.Cod_id, S.Tlf, S.E_mail,
                S.Date_Created, S.Time_Created,
                GROUP_CONCAT(C.Name, ', ') as CourseNames
            FROM Student S
            LEFT JOIN Student_Courses SC ON S.Key = SC.Id_student_key
            LEFT JOIN Course C ON SC.Id_curs = C.Key
            WHERE S.Time_Deleted IS NULL 
            GROUP BY S.Key
            ORDER BY S.Date_Created DESC, S.Time_Created DESC
            LIMIT ? OFFSET ?`;

        const students = await DB.buscarTodo(sqlData, [finalLimit, finalOffset]);
        
        // 4. Cálculo de páginas totales
        const totalPages = Math.ceil(totalElements / finalLimit);

        // Caso: Sin registros
        if (!students || students.length === 0) {
            return {
                success: false,
                message: "No hay estudiantes registrados o activos.",
                data: [],
                pagination: {
                    totalElements,
                    totalPages: 0,
                    currentPage: finalPage,
                    limit: finalLimit,
                    isPaged: totalElements > 20
                }
            };
        }

        // Caso: Éxito con datos
        return {
            success: true,
            data: students,
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
        console.error("Error en GetStudentPaged:", error);
        return { 
            success: false, 
            message: "Error técnico al obtener la lista de estudiantes." 
        };
    }
}

async function SearchStudentPagedName(searchTerm) {
    try {
        const term = `%${searchTerm.trim()}%`;
        const sql = `
            SELECT 
                S.*, 
                GROUP_CONCAT(C.Name, ', ') as CourseNames
            FROM Student S
            LEFT JOIN Student_Courses SC ON S.Key = SC.Id_student_key
            LEFT JOIN Course C ON SC.Id_curs = C.Key
            WHERE S.Time_Deleted IS NULL 
              AND (S.Name LIKE ? OR S.Cod_id LIKE ? OR S.Date_Created LIKE ?)
            GROUP BY S.Key
            ORDER BY S.Name ASC`;

        const students = await DB.buscarTodo(sql, [term, term, term]);
        return { success: !!students.length, data: students, message: "Error en la búsqueda." };
    } catch (error) {
        return { success: false, message: "Error en la búsqueda." };
    }
}

// Para SearchStudentPagedData, simplemente cambia el WHERE:
// AND (S.Date_Created LIKE ? OR S.Cod_id LIKE ?)

async function GetdataStudent(key) {
    try {
        const sql = `
            SELECT 
                S.*, 
                (
                    SELECT GROUP_CONCAT(C.Key || ':' || C.Name, '|') 
                    FROM Student_Courses SC
                    JOIN Course C ON SC.Id_curs = C.Key
                    WHERE SC.Id_student_key = S.Key
                ) as CoursesInfo
            FROM Student S
            WHERE S.Key = ? AND S.Time_Deleted IS NULL`;
        
        let result = await DB.buscar(sql, [key]);
        
        if (result) {
            if (result.CoursesInfo) {
                // Transformamos el string "ID:Nombre|ID:Nombre" en un array de objetos
                result.cursos = result.CoursesInfo.split('|').map(item => {
                    const [id, name] = item.split(':');
                    return { id, name };
                });
            } else {
                result.cursos = [];
            }
            
            // Limpiamos la columna auxiliar del resultado final
            delete result.CoursesInfo;
        }
        
        return result;
    } catch (error) {
        console.error("Error al obtener detalle completo del estudiante:", error);
        return null;
    }
}

async function RegisterStudent(data) {
    const key = uuidv4();
    const est = data.estudiante || {};
    // Si es menor usamos los datos del representante, si no, enviamos null
    const rep = (est.esMenor && data.representante) ? data.representante : {}; 

    const sqlStudent = `
        INSERT INTO Student (
            Key, Name, Cod_id, Address, Tlf, E_mail, Image, Age, Birthdate,
            Name_Representative, Cod_id_Representative, Tlf_Representative, E_mail_Representative,
            Date_Created, Time_Created
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, date('now'), time('now'))`;

    const paramsStudent = [
        key, 
        est.nombre || null, 
        est.cedula || null, 
        est.direccion || null,
        est.telefono || null, 
        est.correo || null, 
        est.imagen || null, 
        est.edad || null,
        est.nacimiento || null, 
        rep.nombre || null, 
        rep.cedula || null, 
        rep.telefono || null, 
        rep.correo || null
    ];

    try {
        // Iniciamos el registro del estudiante
        await DB.crear(sqlStudent, paramsStudent);

        // Si el estudiante tiene cursos seleccionados, los registramos en la tabla intermedia
        if (est.cursos && est.cursos.length > 0) {
            for (const courseId of est.cursos) {
                const sqlRel = `INSERT INTO Student_Courses (Id_student_key, Id_curs) VALUES (?, ?)`;
                await DB.crear(sqlRel, [key, courseId]);
            }
        }

        return { success: true, key };
    } catch (error) {
        console.error("Error al registrar estudiante y sus cursos:", error);
        throw error;
    }
}

async function UpdateStudent(key, data) {
    const est = data.estudiante || {};
    const rep = (est.esMenor && data.representante) ? data.representante : {};

    const sqlUpdateStudent = `
        UPDATE Student SET 
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

    const paramsStudent = [
        est.nombre || null, est.cedula || null, est.direccion || null,
        est.telefono || null, est.correo || null, est.imagen || null, est.edad || null,
        est.nacimiento || null, rep.nombre || null, rep.cedula || null, rep.telefono || null,
        rep.correo || null, key
    ];

    try {
        // 1. Actualizar datos básicos
        await DB.actualizar(sqlUpdateStudent, paramsStudent);

        // 2. Actualizar relación de cursos (Borrar y volver a insertar)
        const sqlDeleteCourses = `DELETE FROM Student_Courses WHERE Id_student_key = ?`;
        await DB.actualizar(sqlDeleteCourses, [key]);

        if (est.cursos && est.cursos.length > 0) {
            for (const courseId of est.cursos) {
                const sqlInsertRel = `INSERT INTO Student_Courses (Id_student_key, Id_curs) VALUES (?, ?)`;
                await DB.crear(sqlInsertRel, [key, courseId]);
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Error al actualizar estudiante:", error);
        throw error;
    }
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
    RegisterStudent:RegisterStudent,
    UpdateStudent:UpdateStudent,
    DeleteStudentLogical:DeleteStudentLogical
}