const path = require('path')
const fs = require('fs')
const os_system = require('os')
const { v4: uuidv4 } = require('uuid');
/*--------------------------------*/
const SAIADB = require(path.join(__dirname,'../DataBase/SAIA_manager.js'))
//console.log(path.join(__dirname,'../DataBase/SAIA.db'))
const DB = new SAIADB(path.join(__dirname,'../DataBase/SAIA.db'));
/*--------------LINK BASE DE DATOS ------------------------*/
const ImageDefault = path.join(__dirname,"../assets/imagen/ImageLogin3.png")
/*-----------------------------------*/

async function LimpiarBaseDeDatos(DB) {
    try {
        console.log("--- Limpiando base de datos ---");
        await DB.beginTransaction();

        // Desactivar temporalmente las claves foráneas para evitar errores al vaciar
        await DB.crear("PRAGMA foreign_keys = OFF;");

        const tablas = ['student', 'Course', 'Instructor', 'Employee', 'User'];
        
        for (const tabla of tablas) {
            // Usamos borrar (DELETE) en lugar de DROP para mantener la estructura
            await DB.borrar(`DELETE FROM ${tabla};`);
            console.log(`Tabla ${tabla} vaciada.`);
        }

        // Reactivar claves foráneas
        await DB.crear("PRAGMA foreign_keys = ON;");
        
        await DB.commit();
        console.log("--- Limpieza completada ---");
    } catch (error) {
        await DB.rollback();
        console.error("Error al limpiar la base de datos:", error);
        throw error;
    }
}

/*----------------------------------------------------------------------------------------*/

async function DataTrialSAIA(DB) {
    try {
        console.log("--- Iniciando generación de datos de prueba ---");
        
        // 1. Iniciar Transacción para velocidad y seguridad
        await DB.beginTransaction();

        const fecha = new Date().toISOString().split('T')[0];
        const hora = new Date().toLocaleTimeString('en-GB', { hour12: false });

        // 2. Insertar 50 Usuarios y 50 Empleados vinculados
        console.log("Insertando 50 Usuarios y Empleados...");
        for (let i = 1; i <= 50; i++) {
            const uKey = `U-${i}`;
            await DB.crear(`INSERT INTO User (Key, Username, Password, PasswordMaster, Permission, Date, Time) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`, 
                [uKey, `usuario${i}`, '123', 'admin123', 'Sub-Administrador', fecha, hora]);

            await DB.crear(`INSERT INTO Employee (Key, Name, Cod_id, Address, Tlf, E_mail, Id_user, Date, Time, Status, Age) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [`E-${i}`, `Empleado ${i}`, `CID-E${i}`, `Direccion ${i}`, `555-${i}`, `emp${i}@mail.com`, uKey, fecha, hora, 'Activo', 20 + (i % 30)]);
        }

        // 3. Insertar 20 Instructores (Necesarios para los cursos)
        console.log("Insertando 20 Instructores...");
        for (let i = 1; i <= 20; i++) {
            await DB.crear(`INSERT INTO Instructor (Key, Name, Cod_id, Address, Tlf, E_mail, Age, Status, Specialty, Date, Time) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [`I-${i}`, `Instructor ${i}`, `CID-I${i}`, `Calle Ins ${i}`, `555-90${i}`, `ins${i}@mail.com`, 30 + i, 'Activo', 'Técnico', fecha, hora]);
        }

        // 4. Insertar Cursos
        console.log("Insertando Cursos...");
        const cursosList = ["Manejo nivel1", "Manejo nivel2", "Manejo nivel3", "Manejo nivel4", "Computación", "Soldadura", "Botanica"];
        const cursoIds = [];

        for (let i = 0; i < cursosList.length; i++) {
            const cKey = `C-${i}`;
            cursoIds.push(cKey);
            const insId = `I-${(i % 20) + 1}`; // Reparte los 20 instructores entre los cursos

            await DB.crear(`INSERT INTO Course (Key, Name, Description, Instructor_ID, Days, Start_Time, End_Time, Duration_Value, Duration_Unit, Capacity, Cost, Date_Created, Time_Created) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [cKey, cursosList[i], `Curso de ${cursosList[i]}`, insId, "Lun,Mar", "08:00", "10:00", 4, "Semanas", 20, "50", fecha, hora]);
        }

        // 5. Insertar 100 Estudiantes (Ahora que cursoIds existe)
        console.log("Insertando 100 Estudiantes...");
        for (let i = 1; i <= 100; i++) {
            const cursoAsignado = cursoIds[i % cursoIds.length];
            
            await DB.crear(
                `INSERT INTO Student (
                    Key, Id_curs, Name, Cod_id, Age, Address, Tlf, E_mail, 
                    Image, Name_Representative, Cod_id_Representative, 
                    Tlf_Representative, E_mail_Representative, Date, Time
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                [
                    `S-${i}`,
                    cursoAsignado,
                    `Estudiante ${i}`,
                    `CID-S${i}`,
                    `${15 + (i % 10)}`, // Edad realista entre 15 y 25
                    `Calle Estudiante ${i}`,
                    `0414-${i}`,
                    `std${i}@mail.com`,
                    ImageDefault,
                    `Representante ${i}`,
                    `CID-R${i}`,
                    `0412-${i}`,
                    `rep${i}@mail.com`,
                    fecha,
                    hora
                ]
            );
        }

        await DB.commit();
        console.log("--- Proceso de prueba finalizado con éxito ---");

    } catch (error) {
        if (DB.isTransactionActive()) {
            await DB.rollback();
        }
        console.error("Error crítico en el trial data:", error);
    }
}

module.exports = DataTrialSAIA;