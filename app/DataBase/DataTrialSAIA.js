const path = require('path');
const fs = require('fs');

/*---------------------------------------------------------*/
// Cargamos la clase desde la ruta proporcionada
const SAIADB = require(path.join(__dirname, '../DataBase/SAIA_manager.js'));
const DB = new SAIADB(path.join(__dirname, '../DataBase/SAIA.db'));

/*-------------- ASSETS ------------------------*/
const ImageDefault = path.join(__dirname, "../assets/imagen/ImageLogin3.png");

/**
 * Limpia las tablas principales respetando la integridad referencial.
 */
async function LimpiarBaseDeDatos() {
    try {
        console.log("--- Limpiando base de datos ---");
        await DB.beginTransaction();

        // Desactivar temporalmente las claves foráneas
        await DB.crear("PRAGMA foreign_keys = OFF;");

        // Orden recomendado: De tablas dependientes a tablas maestras
        const tablas = ['Student', 'Course', 'Instructor', 'Employee', 'User'];
        
        for (const tabla of tablas) {
            await DB.borrar(`DELETE FROM ${tabla};`);
            // Opcional: Reiniciar los contadores de autoincremento si existen
            await DB.borrar(`DELETE FROM sqlite_sequence WHERE name='${tabla}';`).catch(() => {});
            console.log(`Tabla ${tabla} vaciada.`);
        }

        await DB.crear("PRAGMA foreign_keys = ON;");
        await DB.commit();
        console.log("--- Limpieza completada ---");
    } catch (error) {
        await DB.rollback();
        console.error("Error al limpiar la base de datos:", error);
        throw error;
    }
}

/**
 * Genera datos de prueba masivos.
 */
async function DataTrialSAIA() {
    try {
        console.log("--- Iniciando generación de datos de prueba ---");
        
        await DB.beginTransaction();

        const fecha = new Date().toISOString().split('T')[0];
        const hora = new Date().toLocaleTimeString('en-GB', { hour12: false });

        // 1. Insertar Usuarios y Empleados vinculados
        console.log("Insertando 50 Usuarios y Empleados...");
        for (let i = 1; i <= 50; i++) {
            const uKey = `U-${i}`;
            const eKey = `E-${i}`;

            await DB.crear(
                `INSERT INTO User (Key, Username, Password, PasswordMaster, Permission, Date_Created, Time_Created) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
                [uKey, `usuario${i}`, '123', 'admin123', 'Sub-Administrador', fecha, hora]
            );

            await DB.crear(
                `INSERT INTO Employee (Key, Name, Cod_id, Address, Tlf, E_mail, Id_user, Date_Created, Time_Created, Status, Age) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [eKey, `Empleado ${i}`, `CID-E${i}`, `Direccion ${i}`, `555-${i}`, `emp${i}@mail.com`, uKey, fecha, hora, 'Activo', 20 + (i % 30)]
            );
        }

        // 2. Insertar Instructores
        console.log("Insertando 20 Instructores...");
        for (let i = 1; i <= 20; i++) {
            await DB.crear(
                `INSERT INTO Instructor (Key, Name, Cod_id, Address, Tlf, E_mail, Age, Status, Specialty, Date_Created, Time_Created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [`I-${i}`, `Instructor ${i}`, `CID-I${i}`, `Calle Ins ${i}`, `555-90${i}`, `ins${i}@mail.com`, 30 + i, 'Activo', 'Técnico', fecha, hora]
            );
        }

        // 3. Insertar Cursos
        console.log("Insertando Cursos...");
        const cursosList = ["Manejo nivel1", "Manejo nivel2", "Manejo nivel3", "Manejo nivel4", "Computación", "Soldadura", "Botanica"];
        const cursoIds = [];

        for (let i = 0; i < cursosList.length; i++) {
            const cKey = `C-${i}`;
            cursoIds.push(cKey);
            const insId = `I-${(i % 20) + 1}`;

            await DB.crear(
                `INSERT INTO Course (Key, Name, Description, Instructor_ID, Days, Start_Time, End_Time, Duration_Value, Duration_Unit, Capacity, Cost, Date_Created, Time_Created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [cKey, cursosList[i], `Curso de ${cursosList[i]}`, insId, "Lun,Mar", "08:00", "10:00", 4, "Semanas", 20, "50", fecha, hora]
            );
        }

        // 4. Insertar Estudiantes
        console.log("Insertando 100 Estudiantes...");
        for (let i = 1; i <= 100; i++) {
            const cursoAsignado = cursoIds[i % cursoIds.length];
            
            await DB.crear(
                `INSERT INTO Student (
                    Key, Id_curs, Name, Cod_id, Age, Address, Tlf, E_mail, 
                    Image, Name_Representative, Cod_id_Representative, 
                    Tlf_Representative, E_mail_Representative, Date_Created, Time_Created
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                [
                    `S-${i}`, cursoAsignado, `Estudiante ${i}`, `CID-S${i}`, 
                    15 + (i % 10), `Calle Estudiante ${i}`, `0414-${i}`, `std${i}@mail.com`,
                    ImageDefault, `Representante ${i}`, `CID-R${i}`, `0412-${i}`, 
                    `rep${i}@mail.com`, fecha, hora
                ]
            );
        }

        await DB.commit();
        console.log("--- Proceso de prueba finalizado con éxito ---");
        return { success: true, message: "Proceso de prueba finalizado con éxito" };

    } catch (error) {
        // Corrección: isTransactionActive() devuelve una promesa en tu clase
        if (await DB.isTransactionActive()) {
            await DB.rollback();
        }
        console.error("Error crítico en el trial data:", error);
    }
}

module.exports = { DataTrialSAIA:DataTrialSAIA, LimpiarBaseDeDatos:LimpiarBaseDeDatos };