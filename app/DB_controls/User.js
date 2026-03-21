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

async function login_system(data) {
    try {
        await DB.conectar();

        // Agregamos alias (U_ y E_) para evitar colisiones de nombres como 'Key'
        const sql = `
            SELECT
                U.Key AS U_Key, U.Username, U.Permission, U.Password,
                E.Key AS E_Key, E.Name, E.Age, E.Cod_id, E.Address, 
                E.Tlf, E.E_mail, E.Image, E.Id_user
            FROM User U
            INNER JOIN Employee E ON U.Key = E.Id_user
            WHERE U.Username = ? 
              AND U.Password = ? 
              
        `;

        const params = [data.username, data.password];
        const result = await DB.buscar(sql, params);

        // Si result es un array, tomamos el primer elemento [0]
        // Si tu DB.buscar ya devuelve un solo objeto, puedes usar 'row' directamente
        const row = Array.isArray(result) ? result[0] : result;

        if (row) {
            // Estructuramos el objeto de retorno
            return {
                user: {
                    key: row.U_Key,
                    username: row.Username,
                    permission: row.Permission,
                    // Evitamos devolver la password por seguridad si no es necesaria
                },
                employee: {
                    key: row.E_Key,
                    name: row.Name,
                    age: row.Age,
                    cod_id: row.Cod_id,
                    address: row.Address,
                    tlf: row.Tlf,
                    email: row.E_mail,
                    image: row.Image,
                    id_user: row.Id_user
                }
            };
        } else {
            return null; // Es más estándar retornar null o un objeto de error que un string "Error"
        }

    } catch (error) {
        console.error("Error crítico en login_system:", error);
        throw error;
    }
}

async function loginMaster(key, masterInput, permissionInput) {
    try {
        // 1. Buscamos al usuario por su Key
        const query = "SELECT * FROM User WHERE Key = ? AND Time_Deleted IS NULL";
        const user = await DB.ejecutarConsulta(query, [key]);

        // 2. Verificamos si el usuario existe
        if (!user || user.length === 0) {
            return { success: false, message: "Usuario no encontrado o eliminado." };
        }

        const userData = user[0];

        // 3. Validación de PasswordMaster y Permission
        if (userData.PasswordMaster === masterInput && userData.Permission === permissionInput) {
            return {
                success: true,
                message: "Acceso concedido",
                user: {
                    username: userData.Username,
                    permission: userData.Permission
                }
            };
        } else {
            return { success: false, message: "Credenciales o permisos incorrectos." };
        }

    } catch (error) {
        console.error("Error en el proceso de login:", error);
        return { success: false, message: "Error interno del servidor." };
    }
}
/*----------------------------------*/
async function UpdateUsername(key, nuevoUsername) {
    const sql = `UPDATE User SET Username = ? WHERE Key = ?`;
    try {
        await DB.actualizar(sql, [nuevoUsername, key]);
        console.log("Username actualizado con éxito.");
    } catch (error) {
        console.error("Error al actualizar el username:", error);
    }
}
/*----------------------------------------*/
async function UpdateEmail(key, nuevoEmail) {
    const sql = `UPDATE Employee SET E_mail= ? WHERE Key = ?`;
    try {
        await DB.actualizar(sql, [nuevoEmail, key]);
        console.log("Email actualizado con éxito.");
    } catch (error) {
        console.error("Error al actualizar el Email:", error);
    }
}
/*---------------------------------------*/
async function UpdatePassword(key, passwordActual, nuevaPassword) {
    try {
        await DB.conectar();

        // 1. Buscar la contraseña almacenada actualmente para esa Key
        const sqlBuscar = `SELECT Password FROM User WHERE Key = ?`;
       // const sqlBuscar = `SELECT Password FROM User WHERE Key = ? AND Time_deleted IS NULL`;
        const usuario = await DB.buscar(sqlBuscar, [key]);

        // 2. Validar si el usuario existe
        if (!usuario || (Array.isArray(usuario) && usuario.length === 0)) {
            return { success: false, message: "Usuario no encontrado." };
        }

        // Obtener el registro (manejando si es array o objeto único)
        const passwordEnBD = Array.isArray(usuario) ? usuario[0].Password : usuario.Password;

        // 3. Comparar contraseña actual proporcionada vs Base de Datos
        // NOTA: Si usas hashes (bcrypt), aquí usarías: await bcrypt.compare(passwordActual, passwordEnBD)
        if (passwordActual !== passwordEnBD) {
            console.warn("Intento de cambio de clave fallido: La contraseña actual es incorrecta.");
            return { success: false, message: "La contraseña actual no es correcta." };
        }

        // 4. Si coinciden, proceder a actualizar
        const sqlUpdate = `UPDATE User SET Password = ? WHERE Key = ?`;
        await DB.actualizar(sqlUpdate, [nuevaPassword, key]);

        console.log("Password actualizada con éxito.");
        return { success: true, message: "Contraseña actualizada correctamente." };

    } catch (error) {
        console.error("Error crítico en UpdatePassword:", error);
        return { success: false, message: "Error interno del servidor." };
    }
}
/*----------------------------------------*/
async function UpdatePasswordMaster(key, passwordMasterActual, nuevaPasswordMaster) {
    try {
        await DB.conectar();

        // 1. Buscar la contraseña actual (incluyendo filtro de borrado lógico)
        const sqlBuscar = `SELECT PasswordMaster FROM User WHERE Key = ? AND Time_deleted IS NULL`;
        const resultado = await DB.buscar(sqlBuscar, [key]);

        // 2. Validar si el usuario existe
        // Verificamos si el resultado es nulo o un array vacío
        const usuario = Array.isArray(resultado) ? resultado[0] : resultado;

        if (!usuario) {
            return { success: false, message: "Usuario no encontrado o inactivo." };
        }

        // 3. Comparar contraseña (Acceso correcto a la propiedad PasswordMaster)
        const passwordEnBD = usuario.PasswordMaster;

        if (passwordMasterActual !== passwordEnBD) {
            console.warn("Intento de cambio de clave fallido: La contraseña actual es incorrecta.");
            return { success: false, message: "La contraseña actual no es correcta." };
        }

        // 4. Proceder a actualizar (Corrección de la variable nuevaPasswordMaster)
        const sqlUpdate = `UPDATE User SET PasswordMaster = ? WHERE Key = ?`;
        await DB.actualizar(sqlUpdate, [nuevaPasswordMaster, key]);

        console.log("Password actualizada con éxito.");
        return { success: true, message: "Contraseña actualizada correctamente." };

    } catch (error) {
        console.error("Error crítico en UpdatePasswordMaster:", error);
        return { success: false, message: "Error interno del sistema." };
    }
}
/*-----------------------------------------*/

async function UpdateImagenAvatar(key,url){

 const sql = `UPDATE Employee SET Image = ? WHERE Key = ?`;
    try {
        await DB.actualizar(sql, [url, key]);
        console.log("Imagen actualizado con éxito.");
    } catch (error) {
        console.error("Error al actualizar el Imagen:", error);
    }

}
/*------------------------------------------*/
module.exports={
		login_system:login_system,
        UpdateUsername:UpdateUsername,
        UpdateEmail:UpdateEmail,
        UpdatePassword:UpdatePassword,
        UpdatePasswordMaster:UpdatePasswordMaster,
        UpdateImagenAvatar:UpdateImagenAvatar
}

/*

let sql = `
            SELECT 
                U.Username,
                U.Permission,
                E.Name,
                E.Second_name,
                E.Cod_id,
                E.Address,
                E.Tlf,
                E.E_mail,
                E.Id_user
            FROM 
                User U
            INNER JOIN 
                Employee E ON U.Key = E.Id_user
            WHERE 
                U.Username = ?
                AND U.Password = ?
                AND U.Time_deleted IS NULL
                AND E.Time_deleted IS NULL
        `;

*/

/*
 let sql = ` SELECT Username, Password FROM user WHERE Username = ? AND Password = ?`;
*/

/*

        const sql = `
            SELECT
                U.Key AS U_Key, U.Username, U.Permission, U.Password,
                E.Key AS E_Key, E.Name, E.Age, E.Cod_id, E.Address, 
                E.Tlf, E.E_mail, E.Image, E.Id_user
            FROM User U
            INNER JOIN Employee E ON U.Key = E.Id_user
            WHERE U.Username = ? 
              AND U.Password = ? 
              AND U.Time_deleted IS NULL
        `;s
*/