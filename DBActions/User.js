const path = require('path')
const fs = require('fs')
const os_system = require('os')
const { v4: uuidv4 } = require('uuid');
/*-------------------------------------*/
console.log(path.join(__dirname,'../DataBase/SAIA_manager.js'))
const SAIADB = require(path.join(__dirname,'../DataBase/SAIA_manager.js'))
console.log(path.join(__dirname,'../DataBase/SAIA.db'))
const DB = new SAIADB(path.join(__dirname,'../DataBase/SAIA.db'));
/*--------------LINK BASE DE DATOS ------------------------*/

async function login_system(data) {
	console.log(data)
    console.log(data.username)
    console.log(data.password)
    try {
        // 1. Conectar a la base de datos
        await DB.conectar();

        // 2. Definir la consulta SQL con placeholders (?)
       let sql = `
            SELECT 
                U.Username,
                U.Permission,
                E.Name,
                E.Age,
                E.Cod_id,
                E.Address,
                E.Tlf,
                E.E_mail,
                E.Age,
                E.Image,
                E.Id_user
            FROM 
                User U
            INNER JOIN 
                Employee E ON U.Key = E.Id_user
            WHERE 
                U.Username = ?
                AND U.Password = ?
        `;
        // 3. Preparar los parámetros en un array plano
        let params = [data.username, data.password];

        // 4. Ejecutar la búsqueda
        let result = await DB.buscar(sql, params);

        // 5. Verificar y retornar el resultado
        if (result) {
            //console.log("Login exitoso:", result);
            return result;
        } else {
            //console.log("Credenciales incorrectas o usuario eliminado.");
            return "Error";
        }

    } catch (error) {
        // 6. Manejo de errores para evitar UnhandledPromiseRejection
        console.error("Error crítico en login_system:", error);
        throw error; // O manejarlo según tu lógica
    }
}

module.exports={
		login_system:login_system
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
                AND U.time_delet IS NULL
                AND E.time_delet IS NULL
        `;

*/

/*
 let sql = ` SELECT Username, Password FROM user WHERE Username = ? AND Password = ?`;
*/