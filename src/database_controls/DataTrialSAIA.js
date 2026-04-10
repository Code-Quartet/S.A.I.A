const path = require('path');
/*
console.log(path.join(__dirname, './SAIA_manager.js'))
console.log(path.join(__dirname, '../database/SAIA.db'))
console.log(path.join(__dirname, "../assets/imagen/ImageLogin3.png"))
*/
/*---------------------------------------------------------*/
const SAIADB = require(path.join(__dirname, '../../src/database_controls/SAIA_manager.js'));
const DB = new SAIADB(path.join(__dirname, '../../database/SAIA.db'));
/*-------------- ASSETS ------------------------*/
const ImageDefault = path.join(__dirname, "../../assets/imagen/ImageLogin3.png");

/**
 * Limpia las tablas respetando las claves foráneas.
 */
async function LimpiarBaseDeDatos() {
    try {
        console.log("--- Limpiando base de datos ---");
        await DB.beginTransaction();

        await DB.crear("PRAGMA foreign_keys = OFF;");

        // Orden de limpieza para evitar conflictos de integridad
        const tablas = ['Student_Courses', 'Student', 'Course', 'Instructor', 'Employee', 'User_Session', 'User'];
        
        for (const tabla of tablas) {
            await DB.borrar(`DELETE FROM ${tabla};`);
            await DB.borrar(`DELETE FROM sqlite_sequence WHERE name='${tabla}';`).catch(() => {});
            console.log(`[OK] Tabla ${tabla} vaciada.`);
        }

        await DB.crear("PRAGMA foreign_keys = ON;");
        await DB.commit();
        console.log("--- Limpieza completada ---");
    } catch (error) {
        if (await DB.isTransactionActive()) await DB.rollback();
        console.error("Error al limpiar:", error);
        throw error;
    }
}

/**
 * Genera datos de prueba sin dejar campos vacíos.
 */
async function DataTrialSAIA() {
    try {
        console.log("--- Generando datos de prueba ---");
        await DB.beginTransaction();

        const fecha = new Date().toISOString().split('T')[0];
        const hora = new Date().toLocaleTimeString('en-GB', { hour12: false });

        // 1. USUARIOS Y EMPLEADOS
        console.log("> Insertando Usuarios y Empleados...");
        for (let i = 1; i <= 50; i++) {
            const uKey = `U-${i}`;
            await DB.crear(
                `INSERT INTO User (Key, Username, Password, PasswordMaster, Permission, Date_Created, Time_Created) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
                [uKey, `user_admin${i}`, 'hash_123', 'master_789', 'Sub-Administrador', fecha, hora]
            );

            await DB.crear(
                `INSERT INTO Employee (Key, Name, Cod_id, Address, Tlf, E_mail, Image, Birthdate, Status, Age, Id_user, Date_Created, Time_Created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [`E-${i}`, `Empleado Nombre ${i}`, `EMP-00${i}`, `Av. Principal local ${i}`, `+58412${i}`, `emp${i}@saia.com`, ImageDefault, '1990-01-01', 'Activo', '34', uKey, fecha, hora]
            );
        }

        // 2. INSTRUCTORES
        console.log("> Insertando Instructores...");
        const especialidades = ['Programación', 'Mecánica', 'Diseño', 'Soldadura'];
        for (let i = 1; i <= 10; i++) {
            await DB.crear(
                `INSERT INTO Instructor (Key, Name, Cod_id, Address, Tlf, E_mail, Image, Age, Status, Specialty, Certifications, Date_Created, Time_Created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [`I-${i}`, `Prof. Instructor ${i}`, `INS-00${i}`, `Sede Norte ${i}`, `+58424${i}`, `inst${i}@saia.com`, ImageDefault, 25 + i, 'Activo', especialidades[i % 4], 'Certificación Internacional', fecha, hora]
            );
        }

        // 3. CURSOS
        console.log("> Insertando Cursos...");
        const cursosList = ["Manejo Basico","Manejo Pro", "Computación II", "Soldadura Arco", "Excel Avanzado"];
        const cursoKeys = [];
        for (let i = 0; i < cursosList.length; i++) {
            const cKey = `C-${i}`;
            cursoKeys.push(cKey);
            await DB.crear(
                `INSERT INTO Course (Key, Name, Description, Instructor_ID, Days, Start_Time, End_Time, Duration_Value, Duration_Unit, Capacity, Cost, Has_Evaluation, Has_Certificate, Status, Date_Created, Time_Created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [cKey, cursosList[i], `Descripción completa del curso ${cursosList[i]}`, `I-${(i % 10) + 1}`, "Lun,Mie,Vie", "08:00", "12:00", 40, "Semanas", 30, "150.00", 1, 1, 'Activo', fecha, hora]
            );
        }

        // 4. ESTUDIANTES Y MATRÍCULA
        console.log("> Insertando Estudiantes y vinculando a cursos...");
        for (let i = 1; i <= 100; i++) {
            const sKey = `S-${i}`;
            const cursoAleatorio = cursoKeys[i % cursoKeys.length];

            // Insertar Estudiante
            await DB.crear(
                `INSERT INTO Student (Key, Name, Cod_id, Age, Address, Tlf, Birthdate, E_mail, Image, Name_Representative, Cod_id_Representative,Age_Representative,Address_Representative, Tlf_Representative, E_mail_Representative, Date_Created, Time_Created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                [sKey, `Estudiante Apellido ${i}`, `V-${2000000 + i}`, '18', 'Urb. Las Flores', `0412${i}`, '2006-05-12', `alumno${i}@mail.com`, ImageDefault, `Repre ${i}`, `V-${1000000 + i}`,`3${i}`,'Urb. Las Flores', '0414000', `repre${i}@mail.com`, fecha, hora]
            );

            // Insertar en Tabla Intermedia (Relación Muchos a Muchos)
            await DB.crear(
                `INSERT INTO Student_Courses (Id_student_key, Id_curs, Date_Enrolled) VALUES (?, ?, ?)`,
                [sKey, cursoAleatorio, fecha]
            );
        }

        await DB.commit();
        console.log("--- ¡Sistema de prueba cargado con éxito! ---");
        return { success: true };

    } catch (error) {
        if (await DB.isTransactionActive()) await DB.rollback();
        console.error("Error cargando trial data:", error);
        throw error;
    }
}

module.exports = { DataTrialSAIA, LimpiarBaseDeDatos };