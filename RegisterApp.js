
const {app, BrowserWindow, Menu, MenuItem, ipcMain, dialog, Notification } = require('electron');
const path = require('path')
const fs = require('fs')
const os_system = require('os')
const { v4: uuidv4 } = require('uuid');
/*-------------------------------------*/
const SAIADB = require(path.join(__dirname,'./DataBase/SAIA_manager.js'))
const DB = new SAIADB(path.join(__dirname,'./DataBase/SAIA.db'));
/*--------------LINK BASE DE DATOS ------------------------*/

let window_register_app;

module.exports = function Register_App(parentWindow) {
  window_register_app = new BrowserWindow({
        width: 1028,
        height: 620,
        minWidth: 1028,
        minHeight: 620,
        modal: true,
        parent: parentWindow, // Si quieres que sea modal, necesita un padre
        show: false, // Mejor oculto hasta que esté listo
        icon: path.join(__dirname, '../favicon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, "./preload.js")
        }
    });
//console.log(window_register_app)

    window_register_app.loadFile('app/RegisterApp.html');

    // Herramientas de desarrollo
    window_register_app.webContents.openDevTools();

    // Bloquear nuevas ventanas (Forma moderna)
    window_register_app.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    window_register_app.once('ready-to-show', () => {
        window_register_app.show();
    });

    // Limpiar datos al iniciar
    Reset_data();
};
/********************************************************************************************/
function Reset_data(){

        console.log("reset")

        const info = {
                    "state":false,
                    "hostname":"",
                    "plataform":"",
                    "cpu":""                 
                }
        let data = JSON.stringify(info);
        fs.writeFile(".config.json",data, function (err) {
                if (err) throw err;
                  console.log('Saved!');
        });

        DB.conectar("SAIA.db").then(async db => {
  
  console.log("Conectado a una Base de Datos")

      /*------------------------------*/
      const tablas = await DB.listarTablas();
      await console.log('Tablas en la base de datos:',tablas.length);
      /*------------------------------*/
      if(tablas.length>0){
            (async () => {  

              await DB.conectar();
              await DB.borrarTablas();
                  await console.log('Todas las tablas borradas');

                    /*------------------------------*/
                    Adding_table_db()
                    /*------------------------------*/
            })()
      }
      if(tablas.length==0){

            Adding_table_db()

      }

}).catch(err => {
    console.error('No se pudo conectar a la base de datos:', err);
});



}


/*******CREA LA BASE DE DATOS SI NO ESTA Y SE CONECTA****************/


async function Adding_table_db(){

    console.log("creando tablas...")
 
    await DB.conectar();


// Tabla User
  await DB.crearTabla(`CREATE TABLE User (
    Key TEXT PRIMARY KEY, -- Clave primaria
    Username TEXT NOT NULL UNIQUE,         -- Nombre de usuario único
    Password TEXT NOT NULL,                -- Contraseña
    Permission TEXT NOT NULL,              -- Permisos del usuario
    Date DATE NOT NULL,                    -- Fecha de creación
    Time TIME NOT NULL,                    -- Hora de creación
    Time_delet DATE                        -- Fecha de eliminación lógica
)`);

// Tabla Employee
  await DB.crearTabla(`CREATE TABLE Employee (
    Key TEXT PRIMARY KEY, -- Clave primaria
    Name TEXT NOT NULL,                    -- Nombre del empleado
    Cod_id TEXT NOT NULL UNIQUE,           -- Código único del empleado
    Address TEXT,                          -- Dirección
    Tlf TEXT,                              -- Teléfono
    E_mail TEXT UNIQUE,                  -- Correo electrónico único
    Image TEXT,
    Age TEXT UNICODE,
    Id_user TEXT UNIQUE,                       -- Relación con la tabla User
    Date DATE NOT NULL,                    -- Fecha de creación
    Time TIME NOT NULL,                    -- Hora de creación
    Time_delet DATE,                       -- Fecha de eliminación lógica
    FOREIGN KEY (Id_user) REFERENCES User(Key) -- Clave foránea
)`);

//Tabla Alumno
  await DB.crearTabla(`CREATE TABLE student (
    Key TEXT PRIMARY KEY, -- Clave primaria
    Id_curs TEXT NOT NULL,              -- Relación con la tabla Curso
    Id_turno TEXT NOT NULL,             -- Relación con la tabla Horarios
    Name TEXT NOT NULL,                    -- Nombre del alumno
    Second_name TEXT NOT NULL,             -- Segundo nombre o apellido
    Cod_id TEXT NOT NULL UNIQUE,           -- Código único del alumno
    Address TEXT,                          -- Dirección
    Tlf TEXT,                              -- Teléfono
    E_mail TEXT UNIQUE,                    -- Correo electrónico único
    Date DATE NOT NULL,                    -- Fecha de creación
    Time TIME NOT NULL,                    -- Hora de creación
    Time_delet DATE,                       -- Fecha de eliminación lógica
    FOREIGN KEY (Id_curs) REFERENCES Curso(Key), -- Clave foránea
    FOREIGN KEY (Id_turno) REFERENCES Horarios(Key) -- Clave foránea
)`);

//Tabla Curso
  await DB.crearTabla(`CREATE TABLE Course (
    Key TEXT PRIMARY KEY, -- Clave primaria
    Name TEXT NOT NULL UNIQUE,           -- Nombre del curso
    Description TEXT,                      -- Descripción del curso
    Date DATE NOT NULL,                    -- Fecha de creación
    Time TIME NOT NULL,                    -- Hora de creación
    Time_delet DATE                        -- Fecha de eliminación lógica
)`);

//Tabla Horarios
  await DB.crearTabla(`CREATE TABLE Schedule (
    Key TEXT PRIMARY KEY, -- Clave primaria
    Name TEXT NOT NULL UNIQUE,           -- Nombre del horario
    Description TEXT,                      -- Descripción del horario
    Schedule TEXT NOT NULL,                 -- Detalles del horario
    Date DATE NOT NULL,                    -- Fecha de creación
    Time TIME NOT NULL,                    -- Hora de creación
    Time_delet DATE                        -- Fecha de eliminación lógica
)`);


    await DB.cerrar();
}
/*--------------SELECCIONAR IMAGEN USER----------------------------*/
ipcMain.on("select-image-user",(event, arg) => {
 
 //console.log("selectImagen")

      dialog.showOpenDialog(window_register_app,{
        title: 'Seleccionar archivo',
        buttonLabel: 'Abrir',
        filters: [
          { name: 'Imágenes', extensions: ['jpg', 'png', 'gif','jpeg'] }
        ],
        properties: ['openFile']
      }).then(result => {
        //console.log(result.filePaths[0]);
        window_register_app.webContents.send("Imagen-user-select",result.filePaths[0]);

      }).catch(err => {
        console.log(err);
      });



 })
/*--------------SELECCIONAR IMAGEN USER----------------------------*/


/*******CREA LA BASE DE DATOS SI NO ESTA Y SE CONECTA****************/
async function Adding_data_Admin_default(data) {

console.log(data)

    const ID_USER = uuidv4();
    const ID_EMPLOYEE = uuidv4();

    // Iniciamos la conexión
    DB.conectar();

    // Retornamos la promesa para poder encadenar .then() y .catch() afuera si es necesario
    return Promise.all([
        // Inserción en tabla User
        DB.crear(
            `INSERT INTO User (key, Username, Password, Permission, Date, Time) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [ID_USER, data.User.usuario, data.User.clave, 'Administrador', data.fecha, data.hora]
        ),
        // Inserción en tabla Employee (Ajustado a 12 columnas para que coincida con los 12 valores)
        DB.crear(
            `INSERT INTO Employee (Key, Name, Cod_id, Address, Tlf, Age, E_mail, Image,  Id_user, Date, Time) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                ID_EMPLOYEE, 
                data.Employee.nombre, 
                data.Employee.ci, 
                data.Employee.direccion, 
                data.Employee.tlf, 
                data.Employee.edad,
                data.Employee.correo, 
                data.Employee.image, 
                ID_USER, 
                data.fecha, 
                data.hora
               
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


ipcMain.on('open-message-system-user-pass-default', async (event,text) => {

        AlertMessage(text)

})


function AlertMessage(text){

        dialog.showMessageBox({
                title:"Alerta",
                message: text,
                icon: 'error',
                 type:'warning',
                buttons: ['Aceptar'],
                defaultId: 0,
                cancelId: 1
          }).then(result => {
              
                //console.log("btn-press",result.response);
                 window_register_app.webContents.send("Saving-data-default-user");

          }).catch(err => {
              
              console.log(err);
        });


}


ipcMain.on('Instalar-app', async (event,data) => {  

        let hostname = os_system.hostname().toString();
        let platform = os_system.platform().toString();
        let cpu = os_system.cpus()[0].model.toString();

        const info = {
            "state":true,
            "hostname":hostname,
            "plataform":platform,
            "cpu":cpu                 
        }

        let obj = JSON.stringify(info);
        
        await Adding_data_Admin_default(data).then(()=>{
       
            fs.writeFile(".config.json",obj, function(err){
                    if (err) throw err;

                    //console.log('Saved data install!');

                     window_register_app.webContents.send("Completed-Saving-data");
                     setTimeout(()=>{

                        app.relaunch();
                        app.quit();

                     },5000)
                    
            });

        })
        .catch((error)=>{
                console.log("ERROR DATA SAVE REGISTRO")

        })
});


/*   

*/
/********************************************************************************************/
