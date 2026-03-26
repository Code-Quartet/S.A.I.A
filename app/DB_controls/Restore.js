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


async function RestoreCourse(id) {
    try {
        await DB.conectar();
        const sql = `UPDATE Course SET Time_Deleted = NULL WHERE Key = ?`;
        await DB.actualizar(sql, [id]);
        return { success: true, message: "Curso restaurado con éxito." };
    } catch (error) {
        return { success: false, message: "Error al restaurar curso." };
    }
}

async function RestoreStudent(id) {

    console.log("Restore",id)
    
    try {
        await DB.conectar();
        const sql = `UPDATE Student SET Time_Deleted = NULL WHERE Key = ?`;
        await DB.actualizar(sql, [id]);
        return { success: true, message: "Estudiante restaurado con éxito." };
    } catch (error) {
        return { success: false, message: "Error al restaurar estudiante." };
    }
}

async function RestoreEmployee(id) {
    try {
        await DB.conectar();
        const sql = `UPDATE Employee SET Time_Deleted = NULL WHERE Key = ?`;
        await DB.actualizar(sql, [id]);
        return { success: true, message: "Empleado restaurado con éxito." };
    } catch (error) {
        return { success: false, message: "Error al restaurar empleado." };
    }
}

async function RestoreInstructor(id) {
    try {
        await DB.conectar();
        const sql = `UPDATE Instructor SET Time_Deleted = NULL WHERE Key = ?`;
        await DB.actualizar(sql, [id]);
        return { success: true, message: "Instructor restaurado con éxito." };
    } catch (error) {
        return { success: false, message: "Error al restaurar instructor." };
    }
}

module.exports={
    RestoreCourse:RestoreCourse,
    RestoreStudent:RestoreStudent,
    RestoreEmployee:RestoreEmployee,
    RestoreInstructor:RestoreInstructor
}

/*
{
    RestoreCourse,
    RestoreStudent,
    RestoreEmployee,
    RestoreInstructor
}
*/