const path = require('path')
const fs = require('fs')
const os_system = require('os')
const { v4: uuidv4 } = require('uuid');
/*-------------------------------------*/
const SAIADB = require(path.join(__dirname, '../../src/database_controls/SAIA_manager.js'));
const DB = new SAIADB(path.join(__dirname, '../../database/SAIA.db'));
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


async function RegistreEmployee(data) {
    const ID_USER = uuidv4();
    const ID_EMPLOYEE = uuidv4();

    try {
        await DB.beginTransaction();

        // 1. Validar si la Cédula (Cod_id) ya existe
        const checkCI = `SELECT Cod_id FROM Employee WHERE Cod_id = ? LIMIT 1`;
        const existingCI = await DB.buscar(checkCI, [data.Employee.ci]);
        if (existingCI) {
            await DB.rollback();
            return { success: false, message: `La cédula ${data.Employee.ci} ya está registrada.` };
        }

        // 2. Validar si el Username ya existe
        const checkUser = `SELECT Username FROM User WHERE Username = ? LIMIT 1`;
        const existingUser = await DB.buscar(checkUser, [data.User.usuario]);
        if (existingUser) {
            await DB.rollback();
            return { success: false, message: `El nombre de usuario "${data.User.usuario}" ya no está disponible.` };
        }

        // 3. Inserción en tabla User
        await DB.crear(
            `INSERT INTO User (Key, Username, Password, PasswordMaster, Permission, Date_Created, Time_Created) 
             VALUES (?, ?, ?, ?, ?, date('now'), time('now'))`,
            [ID_USER, data.User.usuario, data.User.clave, data.User.Mclave, data.User.permission]
        );

        // 4. Inserción en tabla Employee
        await DB.crear(
            `INSERT INTO Employee (Key, Name, Cod_id, Address, Tlf, Age, E_mail, Birthdate, Image, Status, Id_user, Date_Created, Time_Created) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, date('now'), time('now'))`,
            [
                ID_EMPLOYEE, data.Employee.nombre, data.Employee.ci, data.Employee.direccion, 
                data.Employee.tlf, data.Employee.edad, data.Employee.correo, 
                data.Employee.fechanacimiento, data.Employee.image, data.Employee.status, ID_USER
            ]
        );

        await DB.commit();
        return { success: true, message: "Empleado y Usuario registrados con éxito." };

    } catch (error) {
        await DB.rollback();
        console.error("Error en registro:", error);
        return { success: false, message: error.message || "Error interno en el servidor." };
    }
}


async function UpdateEmployee(employeeKey, updatedData) {
    try {
        await DB.beginTransaction();

        // 1. Validar si la nueva cédula ya pertenece a OTRO empleado
        const sqlCheckCI = `SELECT Name FROM Employee WHERE Cod_id = ? AND Key != ? LIMIT 1`;
        const existingCI = await DB.buscar(sqlCheckCI, [updatedData.Employee.ci, employeeKey]);
        
        if (existingCI) {
            await DB.rollback();
            return { success: false, message: `No se puede actualizar: la cédula ${updatedData.Employee.ci} ya pertenece a otro registro.` };
        }

        // 2. Obtener el Id_user vinculado antes de actualizar
        const res = await DB.buscar(`SELECT Id_user FROM Employee WHERE Key = ?`, [employeeKey]);
        const userKey = res?.Id_user;

        // 3. Validar si el nuevo Username ya pertenece a OTRO usuario
        if (userKey) {
            const sqlCheckUser = `SELECT Username FROM User WHERE Username = ? AND Key != ? LIMIT 1`;
            const existingUser = await DB.buscar(sqlCheckUser, [updatedData.User.usuario, userKey]);
            if (existingUser) {
                await DB.rollback();
                return { success: false, message: `El nombre de usuario "${updatedData.User.usuario}" ya está siendo usado.` };
            }
        }

        // 4. Actualizar tabla Employee
        const sqlUpdateEmployee = `
            UPDATE Employee SET 
                Name = ?, Cod_id = ?, Address = ?, Tlf = ?, E_mail = ?, 
                Age = ?, Image = ?, Birthdate = ?, Status = ?
            WHERE Key = ? AND Time_Deleted IS NULL`;

        await DB.actualizar(sqlUpdateEmployee, [
            updatedData.Employee.nombre, updatedData.Employee.ci, updatedData.Employee.direccion, 
            updatedData.Employee.tlf, updatedData.Employee.correo, updatedData.Employee.edad, 
            updatedData.Employee.image, updatedData.Employee.fechanacimiento, 
            updatedData.Employee.status, employeeKey
        ]);

        // 5. Actualizar tabla User
        if (userKey) {
            const sqlUpdateUser = `
                UPDATE User SET Username = ?, Permission = ?, Password = ?
                WHERE Key = ? AND Time_Deleted IS NULL`;
            
            await DB.actualizar(sqlUpdateUser, [
                updatedData.User.usuario, updatedData.User.permission, 
                updatedData.User.clave, userKey
            ]);
        }

        await DB.commit();
        return { success: true, message: "Datos actualizados correctamente." };

    } catch (error) {
        await DB.rollback();
        console.error("Error al actualizar:", error);
        return { success: false, message: error.message || "Error al procesar la actualización." };
    }
}

async function DeleteEmployeeLogical(employeeKey) {
    const STATUS_REQUIRED = "Despedido";

    try {
        await DB.beginTransaction();

        // 1. Obtener Id_user y Status para validar condiciones
        const sqlFind = `SELECT Id_user, Status FROM Employee WHERE Key = ? AND Time_Deleted IS NULL`;
        const employee = await DB.buscar(sqlFind, [employeeKey]);
        
        // Validar existencia
        if (!employee) {
            await DB.rollback();
            return {
                success: false,
                title:"warning",
                type:"warning",
                message: "El empleado no existe o ya fue desactivado." };
        }

        // 2. Validar que el Status sea el correcto para proceder
        if (employee.Status !== STATUS_REQUIRED) {
            await DB.rollback();
            return { 
                success: false,
                title:"Error",
                type:"error",
                message: `No se puede eliminar: El estado actual es '${employee.Status}', pero debe ser '${STATUS_REQUIRED}'.` 
            };
        }

        const userKey = employee.Id_user;

        // 3. Marcar borrado lógico en Employee
        const sqlDelEmployee = `UPDATE Employee SET Time_Deleted = date('now') WHERE Key = ?`;
        await DB.actualizar(sqlDelEmployee, [employeeKey]);

        // 4. Marcar borrado lógico en User si existe relación
        if (userKey) {
            const sqlDelUser = `UPDATE User SET Time_Deleted = date('now') WHERE Key = ?`;
            await DB.actualizar(sqlDelUser, [userKey]);
        }

        await DB.commit();
        return { success: true,
         title:"info", 
         type:"info",
         message: "Registro desactivado con éxito." };

    } catch (error) {
        // Aseguramos el rollback en caso de cualquier error de DB
        if (DB.inTransaction) await DB.rollback();
        console.error("Error en el borrado lógico:", error);
        return { success: false, message: "Error interno en el servidor." };
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


async function verificarSiEsAdministrador(employeeKey) {
    const query = `
        SELECT U.Permission 
        FROM Employee E
        INNER JOIN User U ON E.Id_user = U.Key
        WHERE E.Key = ? AND E.Time_Deleted IS NULL;
    `;

    try {
        // Ejecutamos la consulta pasando el parámetro para evitar SQL Injection
        const resultado = await DB.buscar(query, [employeeKey]);

        if (!resultado) {
            return { 
                isAdmin: false, 
                message: "Empleado no encontrado o no tiene un usuario vinculado." 
            };
        }

        // Verificamos si el permiso coincide exactamente con 'Administrador'
        if (resultado.Permission === 'Administrador') {
            return { 
                isAdmin: true, 
                //message: "Acceso confirmado: El usuario tiene permisos de Administrador." 
                message: "Cambios de datos de empleado con permisos de Administrador." 
            };
        } else {
            return { 
                isAdmin: false, 
                message: `Acceso denegado: El usuario tiene nivel ${resultado.Permission}.` 
            };
        }

    } catch (error) {
        console.error("Error al verificar permisos:", error);
        throw new Error("Error interno al consultar la base de datos.");
    }
}


async function SearchFilterEmployee(status) {
    try {
        await DB.conectar();

        // 1. Normalizar la entrada: si es un string único, lo convertimos a array
        const statusArray = Array.isArray(status) ? status : [status];
        
        // 2. Crear los placeholders (?, ?, ?) dinámicamente
        const placeholders = statusArray.map(() => '?').join(', ');

        // 3. Construir la consulta con el operador IN
        const sql = `
            SELECT Key, Name, Cod_id, E_mail, Tlf, Status
            FROM Employee 
            WHERE Status IN (${placeholders}) AND Time_Deleted IS NULL 
            ORDER BY Name ASC`;

        // 4. Ejecución pasando el array de estados
        const results = await DB.buscarTodo(sql, statusArray);

        if (!results || results.length === 0) {
            return {
                success: false,
                message: `No se encontraron empleados con los estados: "${statusArray.join(', ')}".`
            };
        }

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

module.exports={
	GetEmployeeWithUser:GetEmployeeWithUser,
	RegistreEmployee:RegistreEmployee,
	UpdateEmployee:UpdateEmployee,
	DeleteEmployeeLogical:DeleteEmployeeLogical,
	GetEmployeesPaged:GetEmployeesPaged,
    DeleteEmployeePermanent:DeleteEmployeePermanent,
    searchEmployee:searchEmployee,
    SearchFilterEmployee:SearchFilterEmployee,
    verificarSiEsAdministrador:verificarSiEsAdministrador


}