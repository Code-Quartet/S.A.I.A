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

/*-----------------------------*/
async function SelectUpdateCourseKey(key){

    let sql = `
            SELECT c.*, i.Name AS Nombre_Instructor 
            FROM Course c
            LEFT JOIN Instructor i ON c.Instructor_ID = i.Key
            WHERE c.Time_Deleted IS NULL AND c.Key LIKE ?
        `;
        const params = [key];

        let result = await DB.buscar(sql, params);
        //console.log(result)
        return result
}
/******************************************************/
async function GetCoursePaged(page = 1, limit = 10) {
    try {
        await DB.conectar();
        
        const currentPage = Math.max(1, parseInt(page));
        const currentLimit = Math.max(1, parseInt(limit));
        const offset = (currentPage - 1) * currentLimit;

        const sqlCount = `SELECT COUNT(*) as total FROM Course WHERE Time_Deleted IS NULL`;
        const resCount = await DB.buscar(sqlCount);
        const totalElements = resCount[0]?.total || 0;

        const sqlData = `
            SELECT 
                C.Key, C.Name, C.Capacity, C.Start_Time, C.End_Time, 
                C.Status, C.Cost, C.Days, C.Instructor_ID,
                I.Name as Instructor_Name,
                (SELECT COUNT(*) FROM Student S WHERE S.Id_curs = C.Key AND S.Time_Deleted IS NULL) AS Total_Students
            FROM Course C
            LEFT JOIN Instructor I ON C.Instructor_ID = I.Key
            WHERE C.Time_Deleted IS NULL 
            ORDER BY C.Date_Created DESC, C.Name ASC 
            LIMIT ? OFFSET ?`;

        const courses = await DB.buscarTodo(sqlData, [currentLimit, offset]);
        const totalPages = Math.ceil(totalElements / currentLimit);

        return {
            success: true,
            data: courses,
            pagination: { totalElements, totalPages, currentPage, limit: currentLimit, hasNext: currentPage < totalPages, hasPrev: currentPage > 1 }
        };
    } catch (error) {
        console.error("Error en GetCoursePaged:", error);
        return { success: false, data: [], message: "Error al obtener cursos." };
    }
}


async function GetAllKeyNameInnstructor(){
    const sql = `SELECT Key, Name FROM Instructor ORDER BY Name ASC`;
    return await DB.buscarTodo(sql);
}

async function SearchCourse(searchTerm){
    try {
        await DB.conectar(); 
        const termClean = searchTerm ? searchTerm.trim() : "";
        if (!termClean) return { success: false, message: "Debe ingresar un nombre o código." };

        let sql = `
            SELECT 
                c.*, 
                i.Name AS Instructor_Name,
                (SELECT COUNT(*) FROM Student s WHERE s.Id_curs = c.Key AND s.Time_Deleted IS NULL) AS Total_Students
            FROM Course c
            LEFT JOIN Instructor i ON c.Instructor_ID = i.Key
            WHERE c.Time_Deleted IS NULL 
            AND (c.Name LIKE ? OR c.Status LIKE ?)
            ORDER BY c.Name ASC`;
        
        const wildCardTerm = `%${termClean}%`;
        const results = await DB.buscarTodo(sql, [wildCardTerm, wildCardTerm]);

        if (!results || results.length === 0) {
            return { success: false, message: "No se encontraron resultados.", data: [] };
        }

        return { success: true, data: results, count: results.length };
    } catch (error) {
        return { success: false, message: "Error en la búsqueda.", data: [] };
    }
}

async function SearchCourseByStatus(statusArray) {
    try {
        await DB.conectar();
        if (!statusArray || !Array.isArray(statusArray) || statusArray.length === 0) {
            return { success: false, message: "No se seleccionaron estados." };
        }

        const placeholders = statusArray.map(() => "?").join(",");
        const sql = `
            SELECT 
                c.Key, c.Name, c.Capacity, c.Status, c.Cost, c.Instructor_ID,
                i.Name AS Nombre_Instructor,
                (SELECT COUNT(*) FROM Student s WHERE s.Id_curs = c.Key AND s.Time_Deleted IS NULL) AS Total_Students
            FROM Course c
            LEFT JOIN Instructor i ON c.Instructor_ID = i.Key
            WHERE c.Status IN (${placeholders}) 
            AND c.Time_Deleted IS NULL 
            ORDER BY c.Name ASC`;

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


async function InformationCourseSelect(key){

   let sql = `
            SELECT 
                c.*, 
                i.Name AS Nombre_Instructor,
                (SELECT COUNT(*) FROM Student s WHERE s.Id_curs = c.Key AND s.Time_Deleted IS NULL) AS Total_Students
            FROM Course c
            LEFT JOIN Instructor i ON c.Instructor_ID = i.Key
            WHERE c.Time_Deleted IS NULL AND c.Key = ?
        `;
    return await DB.buscar(sql, [key]);
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
    InformationCourseSelect:InformationCourseSelect
}

    /*
,
    Get_data_course_update:Get_data_course_update

    {
    "nombre": "Coducir",
    "descripcion": "manejo",
    "instructor": "617dda98-9b56-4003-94d2-20aa67d571c8",
    "dias": [
        "Lun",
        "Jue",
        "Vie"
    ],
    "hora_inicio": "00:00",
    "hora_fin": "00:00",
    "duracion_valor": "2",
    "duracion_unidad": "Semanas",
    "costo": "20",
    "evaluacion": "on",
    "certificado": "on"
}*/
/*
  await DB.crearTabla(`CREATE TABLE Course (
    Key TEXT PRIMARY KEY,                 -- UUID o Código único
    Name TEXT NOT NULL UNIQUE,            -- Nombre del curso
    Description TEXT,                     -- Descripción detallada
    Instructor_ID TEXT NOT NULL,          -- Relación con tabla de instructores
    Days TEXT NOT NULL,                   -- Días (Ej: "Lun,Mie,Vie")
    Start_Time TIME NOT NULL,             -- Hora de inicio (Ej: "08:30")
    End_Time TIME NOT NULL,               -- Hora de fin (Ej: "10:30")
    Duration_Value INTEGER NOT NULL,      -- Cantidad (Ej: 2)
    Duration_Unit TEXT NOT NULL,          -- Unidad (Ej: "Semanas")
    Capacity INTEGER,                     -- Cupo máximo (Ej: 20)
    Cost TEXT,                            -- Costo (Ej: "30$")
    Has_Evaluation BOOLEAN DEFAULT 0,     -- 1 = Sí, 0 = No
    Has_Certificate BOOLEAN DEFAULT 0,    -- 1 = Sí, 0 = No
    Status TEXT DEFAULT 'Activo',         -- Activo, Inactivo, Completado, etc.
    Date_Created DATE NOT NULL,           -- Fecha de creación
    Time_Created TIME NOT NULL,           -- Hora de creación
    Time_Deleted DATE                     -- Borrado lógico

)`);
*/