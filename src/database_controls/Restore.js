const path = require('path')
const fs = require('fs')
const os_system = require('os')
const { v4: uuidv4 } = require('uuid');
/*-------------------------------------*/
const SAIADB = require(path.join(__dirname, '../../src/database_controls/SAIA_manager.js'));
const DB = new SAIADB(path.join(__dirname, '../../database/SAIA.db'));


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

async function RestoreEmployee(employeeKey) {
    try {
        await DB.beginTransaction();

        // 1. Verificar existencia del empleado y obtener su Id_user
        // Buscamos específicamente los que tienen Time_Deleted para no procesar activos
        const sqlFind = `SELECT Id_user FROM Employee WHERE Key = ? AND Time_Deleted IS NOT NULL`;
        const employee = await DB.buscar(sqlFind, [employeeKey]);

        if (!employee) {
            await DB.rollback();
            return {
                success: false,
                title: "warning",
                type: "warning",
                message: "El empleado no existe o ya se encuentra activo."
            };
        }

        const userKey = employee.Id_user;

        // 2. Restaurar el registro en la tabla Employee
        const sqlRestoreEmployee = `UPDATE Employee SET Time_Deleted = NULL WHERE Key = ?`;
        await DB.actualizar(sqlRestoreEmployee, [employeeKey]);

        // 3. Restaurar el registro en la tabla User (si existe relación)
        if (userKey) {
            const sqlRestoreUser = `UPDATE User SET Time_Deleted = NULL WHERE Key = ?`;
            await DB.actualizar(sqlRestoreUser, [userKey]);
        }

        await DB.commit();

        return {
            success: true,
            title: "success",
            type: "success",
            message: "Empleado y usuario asociados han sido restaurados."
        };

    } catch (error) {
        // Revertir cambios si algo falla durante la restauración
        if (DB.inTransaction) await DB.rollback();
        console.error("Error en la restauración lógica:", error);
        return {
            success: false,
            title: "Error",
            type: "error",
            message: "Error interno al intentar restaurar el registro."
        };
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