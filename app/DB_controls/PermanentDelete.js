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




// --- BORRAR CURSO PERMANENTEMENTE ---
async function DeleteCoursePermanent(id) {
    try {
        await DB.conectar();
        // Nota: Si hay estudiantes inscritos, esto podría fallar por integridad referencial
        const sql = `DELETE FROM Course WHERE Key = ?`;
        await DB.borrar(sql, [id]);
        
        return { 
            success: true, 
            message: "Curso eliminado definitivamente de la base de datos." 
        };
    } catch (error) {
        console.error("Error Delete Course:", error);
        return { success: false, message: "No se pudo eliminar el curso (verifique si tiene registros asociados)." };
    }
}

// --- BORRAR ESTUDIANTE PERMANENTEMENTE ---
async function DeleteStudentPermanent(id) {
    try {
        await DB.conectar();
        const sql = `DELETE FROM Student WHERE Key = ?`;
        await DB.borrar(sql, [id]);
        
        return { success: true, message: "Estudiante eliminado permanentemente." };
    } catch (error) {
        return { success: false, message: "Error al eliminar el estudiante." };
    }
}

// --- BORRAR EMPLEADO PERMANENTEMENTE ---
async function DeleteEmployeePermanent(id) {
    try {
        await DB.conectar();
        const sql = `DELETE FROM Employee WHERE Key = ?`;
        await DB.borrar(sql, [id]);
        
        return { success: true, message: "Empleado eliminado permanentemente." };
    } catch (error) {
        return { success: false, message: "Error al eliminar el empleado." };
    }
}

// --- BORRAR INSTRUCTOR PERMANENTEMENTE ---
async function DeleteInstructorPermanent(id) {
    try {
        await DB.conectar();
        const sql = `DELETE FROM Instructor WHERE Key = ?`;
        await DB.borrar(sql, [id]);
        
        return { success: true, message: "Instructor eliminado permanentemente." };
    } catch (error) {
        return { success: false, message: "Error al eliminar el instructor (puede tener cursos asignados)." };
    }
}

async function ClearAllTrash() {
    try {
        await DB.conectar();
        
        // Definimos las tablas que manejan borrado lógico
        const tables = ['Course', 'Student', 'Employee', 'Instructor'];
        
        // Ejecutamos la eliminación en cada una
        for (const table of tables) {
            const sql = `DELETE FROM ${table} WHERE Time_Deleted IS NOT NULL`;
            await DB.borrar(sql);
        }

        return { 
            success: true, 
            message: "Se han eliminado permanentemente todos los elementos de la papelera." 
        };
    } catch (error) {
        console.error("Error al vaciar papelera global:", error);
        return { 
            success: false, 
            message: "Error al intentar vaciar la papelera. Es posible que existan dependencias entre registros." 
        };
    }
}

module.exports={

	ClearAllTrash:ClearAllTrash,
	DeleteInstructorPermanent:DeleteInstructorPermanent,
	DeleteEmployeePermanent:DeleteEmployeePermanent,
	DeleteStudentPermanent:DeleteStudentPermanent,
	DeleteCoursePermanent:DeleteCoursePermanent
}

//const {ClearAllTrash, DeleteInstructorPermanent, DeleteEmployeePermanent, DeleteStudentPermanent, DeleteCoursePermanent }