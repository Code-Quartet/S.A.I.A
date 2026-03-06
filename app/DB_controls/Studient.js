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

async function RegisterStudent(data, idCurs = "DEFAULT_CURS", idTurno = "DEFAULT_TURNO") {
    
    let Id_Studient = uuidv4();

    const sql = `INSERT INTO student (
        Key, Id_curs, Id_turno, Name, Second_name, Cod_id, 
        Address, Tlf, E_mail, Date, Time
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    // Mapeo de datos: 
    // Usamos 'Nombre' para Name y un string vacío para Second_name (ya que el objeto no lo trae separado)
    const params = [
        Id_Studient,
        idCurs,
        idTurno,
        data.nombre,
        data.cedula,
        data.direccion,
        data.tlf,
        data.correo,
        data.fecha,
        data.hora
    ];

    try {
        return await db.crear(sql, params);
    } catch (err) {
        console.error("Error en RegisterStudent:", err);
        throw err;
    }
}

/**
 * Actualiza los datos de un estudiante basado en su Cod_id (cédula)
 */
async function UpdateStudent(data) {
    const sql = `UPDATE student SET 
        Name = ?, 
        Address = ?, 
        Tlf = ?, 
        E_mail = ?
        WHERE Cod_id = ?`;

    const params = [
        data.nombre,
        data.direccion,
        data.tlf,
        data.correo,
        data.cedula // Usado como identificador en el WHERE
    ];

    try {
        return await db.actualizar(sql, params);
    } catch (err) {
        console.error("Error en UpdateStudent:", err);
        throw err;
    }
}

/**
 * Realiza una eliminación lógica (seteando Time_delet) 
 * o física (DELETE) según prefieras.
 */
async function DeleteStudent(cedula) {
    // Opción A: Eliminación física
    const sql = `DELETE FROM student WHERE Cod_id = ?`;
    
    /* // Opción B: Eliminación lógica (recomendado para auditoría)
    const sql = "UPDATE student SET Time_delet = date('now') WHERE Cod_id = ?";
    */

    try {
        return await db.borrar(sql, [cedula]);
    } catch (err) {
        console.error("Error en DeleteStudent:", err);
        throw err;
    }
}
module.exports={

}