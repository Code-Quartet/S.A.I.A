const path = require('path')
const fs = require('fs')
const os_system = require('os')
const { v4: uuidv4 } = require('uuid');
/*-------------------------------------*/
const SAIADB = require(path.join(__dirname,'../DataBase/SAIA_manager.js'))
const DB = new SAIADB(path.join(__dirname,'../DataBase/SAIA.db'));
/*--------------LINK BASE DE DATOS ------------------------*/


async function GetEmployeeWithUser(employeeKey) {
    try {
        await DB.conectar();

        // Seleccionamos campos de ambas tablas usando alias para evitar confusiones
        const sql = `
            SELECT 
                E.Key AS EmployeeKey,
                E.Name,
                E.Cod_id,
                E.Address,
                E.Tlf,
                E.E_mail,
                E.Image,
                E.Age,
                E.Status,
                E.Birthdate,
                E.Date_Created AS EmployeeDate,
                U.Key AS UserKey,
                U.Username,
                U.Password,
                U.PasswordMaster,
                U.Permission,
                U.Date_Created AS UserDate
            FROM Employee E
            INNER JOIN User U ON E.Id_user = U.Key
            WHERE E.Key = ? AND E.Time_Deleted IS NULL AND U.Time_Deleted IS NULL
        `;

        const resultado = await DB.buscar(sql, [employeeKey]);

        // Manejar si el resultado es un array o un objeto único
        const datos = Array.isArray(resultado) ? resultado[0] : resultado;

        if (!datos) {
            return { 
                success: false, 
                message: "No se encontró el empleado o el usuario asociado está inactivo." 
            };
        }

        return {
            success: true,
            data: datos
        };

    } catch (error) {
        console.error("Error al obtener datos cruzados:", error);
        return { success: false, message: "Error interno al consultar los datos." };
    }
}

async function GetEmployeesPaged(page = 1, limit = 10) {

   try {
       await DB.conectar();
        // 1. Obtener el total de empleados activos (sin borrado lógico)
        const sqlCount = `SELECT COUNT(*) as total FROM Employee WHERE Time_Deleted IS NULL`;
        const resCount = await DB.buscar(sqlCount);
        
        // Manejo de respuesta según como retorne el objeto tu método .buscar()
        const totalElements = resCount?.total ?? 0;

        // 2. Lógica adaptativa:
        // Si hay 20 o menos, forzamos mostrar todo en una sola vista
        let finalLimit = limit;
        let offset = (page - 1) * limit;

        if (totalElements <= 20) {
            finalLimit = totalElements;
            offset = 0;
        }

        // 3. Consulta de los campos específicos solicitados
   /*
        const sqlData = `
            SELECT Key, Name, E_mail, Tlf, Status, Date_Created, Time_Created
            FROM Employee
            WHERE Time_Deleted IS NULL 
            ORDER BY Date_Created DESC, Time_Created DESC 
            LIMIT ? OFFSET ?`;*/

            const sqlData = `
    SELECT Key, Name, E_mail, Tlf, Status, Date_Created, Time_Created
    FROM Employee
    WHERE Time_Deleted IS NULL 
    ORDER BY Date_Created DESC, Time_Created DESC 
    LIMIT ? OFFSET ?`;

        const Employees = await DB.buscarTodo(sqlData, [finalLimit, offset]);

        // 4. Calcular total de páginas
        const totalPages = totalElements <= 20 ? 1 : Math.ceil(totalElements / limit);

        if(!Employees || Employees.length === 0) {
                return {
                    success: false,
                    message: `No se encontraron empleados`,
                    pagination: {
                    totalElements,
                    totalPages,
                    currentPage: totalElements <= 20 ? 1 : page,
                    limit: finalLimit,
                    isPaged: totalElements > 20 // Flag para saber si mostrar controles de paginación en el frontend
                }
            };
        }


        return {
            success: true,
            data: Employees,
            pagination: {
                totalElements,
                totalPages,
                currentPage: totalElements <= 20 ? 1 : page,
                limit: finalLimit,
                isPaged: totalElements > 20 // Flag para saber si mostrar controles de paginación en el frontend
            }
        };



    } catch (error) {
        console.error("Error en GetEmployeesPaged:", error);
        return { 
            success: false, 
            message: "Error al obtener la lista de empleados." 
        };
    }
}

async function searchEmployee(searchTerm) {
    try {
        await DB.conectar();

        const termClean = searchTerm ? searchTerm.trim() : "";

        if (!termClean) {
            return { success: false, message: "Debe ingresar un nombre o código." };
        }

        // CORRECCIÓN: Quitamos el prefijo "S." o definimos "Employee S"
        // También aseguramos que las columnas coincidan con tu esquema (Cod_id vs CodId)
        let sql = `
            SELECT Key, Name, E_mail, Tlf, Status, Cod_id
            FROM Employee 
            WHERE Time_Deleted IS NULL 
            AND (Name LIKE ? OR Cod_id LIKE ?)`;

        const search = `%${termClean}%`;

        // Pasamos el parámetro para ambos "?"
        const results = await DB.buscarTodo(sql, [search, search]);

        if (!results || results.length === 0) {
            return {
                success: false,
                message: "No se encontraron registros con los criterios proporcionados."
            };
        }

        return {
            success: true,
            data: results 
        };

    } catch (error) {
        console.error("Error en searchEmployee:", error);
        return { 
            success: false, 
            message: "Error en el servidor al procesar la búsqueda." 
        };
    }
}

async function SearchFilterEmployee(status) {
    try {
        // 1. Conexión a la base de datos
        await DB.conectar();

        // 2. Consulta SQL filtrando por Status y excluyendo eliminados
        const sql = `
            SELECT Key, Name, Cod_id, E_mail, Tlf, Status
            FROM Employee 
            WHERE Status = ? AND Time_Deleted IS NULL 
            ORDER BY Name ASC`;

        // 3. Ejecución de la búsqueda pasando el parámetro
        const results = await DB.buscarTodo(sql, [status]);

        // 4. Validación: Si no hay registros, retornar success false
        if (!results || results.length === 0) {
            return {
                success: false,
                message: `No se encontraron empleados con el estado: "${status}".`
            };
        }

        // 5. Retorno exitoso con la data
        return {
            success: true,
            data: results
        };

    } catch (error) {
        console.error("Error en SearchFilterEmployee:", error);
        return { 
            success: false, 
            message: "Error al intentar filtrar por estado." 
        };
    }
}

async function RegistreEmployee(data){
 
    const ID_USER = uuidv4();
    const ID_EMPLOYEE = uuidv4();

    // Iniciamos la conexión
    DB.conectar();

    // Retornamos la promesa para poder encadenar .then() y .catch() afuera si es necesario
    return Promise.all([
        // Inserción en tabla User
        DB.crear(
            `INSERT INTO User (key, Username, Password, PasswordMaster, Permission, Date_Created, Time_Created) 
             VALUES (?, ?, ?, ?, ?, date('now'), time('now'))`,
            [ID_USER, data.User.usuario, data.User.clave, data.User.Mclave, data.User.permission]
        ),
        // Inserción en tabla Employee (Ajustado a 12 columnas para que coincida con los 12 valores)
      DB.crear(
            `INSERT INTO Employee (Key, Name, Cod_id, Address, Tlf, Age, E_mail, Birthdate, Image, Status, Id_user, Date_Created, Time_Created) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, date('now'), time('now'))`,
			[
                ID_EMPLOYEE, 
                data.Employee.nombre, 
                data.Employee.ci, 
                data.Employee.direccion, 
                data.Employee.tlf, 
                data.Employee.edad,
                data.Employee.correo, 
                data.Employee.fechanacimiento, 
                data.Employee.image,
                data.Employee.status,
                ID_USER
               
            ]
        )
    ])
    .then(() => {
        console.log("Registro exitoso del Administrador y Empleado");
        return { success: true, message: "Datos insertados correctamente" };
    })
    .catch((error) => {
        console.error("Error al insertar datos:", error);
        throw error; // Relanzamos para que quien llame a la función sepa que falló
    })
    .finally(() => {
        // Cerramos la base de datos siempre, sin importar si hubo éxito o error
        DB.cerrar();
    });
}

async function UpdateEmployee(employeeKey, updatedData) {

    try {
        // Usamos los métodos de la clase SAIADB que ya garantizan conexión
        await DB.beginTransaction();

        // 1. Actualizar datos en la tabla Employee
        // Corregido: eliminada coma antes del WHERE, eliminado Image duplicado y corregido orden de campos
        const sqlUpdateEmployee = `
            UPDATE Employee SET 
                Name = ?, 
                Cod_id = ?, 
                Address = ?, 
                Tlf = ?, 
                E_mail = ?, 
                Age = ?,
                Image = ?,
                Birthdate = ?,
                Status = ?
            WHERE Key = ? AND Time_Deleted IS NULL`;

        const paramsEmployee = [
            updatedData.Employee.nombre, 
            updatedData.Employee.ci, 
            updatedData.Employee.direccion, 
            updatedData.Employee.tlf, 
            updatedData.Employee.correo, 
            updatedData.Employee.edad,
            updatedData.Employee.image,
            updatedData.Employee.fechanacimiento, 
            updatedData.Employee.status,
            employeeKey
        ];

        await DB.actualizar(sqlUpdateEmployee, paramsEmployee);

        // 2. Obtener el Id_user vinculado
        const sqlFindUser = `SELECT Id_user FROM Employee WHERE Key = ?`;
        const res = await DB.buscar(sqlFindUser, [employeeKey]);
        const userKey = res?.Id_user;

        // 3. Actualizar tabla User si existe el vínculo
        if (userKey) {
            const sqlUpdateUser = `
                UPDATE User SET 
                    Username = ?, 
                    Permission = ?,
                    Password = ?
                WHERE Key = ? AND Time_Deleted IS NULL`;
            
            await DB.actualizar(sqlUpdateUser, [
                updatedData.User.usuario, 
                updatedData.User.permission, 
                updatedData.User.clave, // Se agregó 'clave' que faltaba en tus params
                userKey
            ]);
        }

        await DB.commit();
        console.log("Empleado y usuario actualizados con éxito.");
        return { success: true, message: "Datos actualizados correctamente." };

    } catch (error) {
        await DB.rollback();
        console.error("Error al actualizar empleado:", error);
        return { success: false, message: "Error al intentar guardar los cambios." };
    }
}

async function DeleteEmployeeLogical(employeeKey) {
    try {
        await DB.beginTransaction();

        // 1. Obtener el Id_user (Garantizamos que el empleado existe)
        const sqlFindUser = `SELECT Id_user FROM Employee WHERE Key = ? AND Time_Deleted IS NULL`;
        const employee = await DB.buscar(sqlFindUser, [employeeKey]);
        
        if (!employee) {
            await DB.rollback();
            return { success: false, message: "El empleado no existe o ya fue desactivado." };
        }

        const userKey = employee.Id_user;
        const fechaActual = new Date().toISOString().split('T')[0];

        // 2. Marcar borrado lógico en Employee
        const sqlDelEmployee = `UPDATE Employee SET Time_Deleted = ? WHERE Key = ?`;
        await DB.actualizar(sqlDelEmployee, [fechaActual, employeeKey]);

        // 3. Marcar borrado lógico en User si existe
        if (userKey) {
            const sqlDelUser = `UPDATE User SET Time_Deleted = ? WHERE Key = ?`;
            await DB.actualizar(sqlDelUser, [fechaActual, userKey]);
        }

        await DB.commit();
        return { success: true, message: "Registro desactivado con éxito." };

    } catch (error) {
        await DB.rollback();
        console.error("Error en el borrado lógico:", error);
        return { success: false, message: "Error interno: " + error.message };
    }
}

async function DeleteEmployeePermanent(employeeKey) {
    try {
        await DB.beginTransaction();

        // 1. Obtener el ID del usuario antes de borrar al empleado
        const sqlFindUser = `SELECT Id_user FROM Employee WHERE Key = ?`;
        const employee = await DB.buscar(sqlFindUser, [employeeKey]);

        if (!employee) {
            await DB.rollback();
            return { success: false, message: "No se encontró el registro para eliminar." };
        }

        const userKey = employee.Id_user;

        // 2. Eliminar el registro de Employee
        const sqlDeleteEmployee = `DELETE FROM Employee WHERE Key = ?`;
        await DB.actualizar(sqlDeleteEmployee, [employeeKey]);

        // 3. Eliminar el registro de User si existe
        if (userKey) {
            const sqlDeleteUser = `DELETE FROM User WHERE Key = ?`;
            await DB.actualizar(sqlDeleteUser, [userKey]);
        }

        await DB.commit();
        return { success: true, message: "Registro eliminado permanentemente." };

    } catch (error) {
        await DB.rollback();
        console.error("Error en el borrado permanente:", error);
        return { success: false, message: "Error interno al eliminar." };
    }
}

module.exports={
	GetEmployeeWithUser:GetEmployeeWithUser,
	RegistreEmployee:RegistreEmployee,
	UpdateEmployee:UpdateEmployee,
	DeleteEmployeeLogical:DeleteEmployeeLogical,
	GetEmployeesPaged:GetEmployeesPaged,
    DeleteEmployeePermanent:DeleteEmployeePermanent,
    searchEmployee:searchEmployee,
    SearchFilterEmployee:SearchFilterEmployee


}