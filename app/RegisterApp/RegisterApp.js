
const {app, BrowserWindow, Menu, MenuItem, ipcMain, dialog, Notification } = require('electron');
const path = require('path')
const fs = require('fs')
const os_system = require('os')
const { v4: uuidv4 } = require('uuid');
/*-------------------------------------*/
const SAIADB = require(path.join(__dirname,'../DataBase/SAIA_manager.js'))
const DB = new SAIADB(path.join(__dirname,'../DataBase/SAIA.db'));
const { DataTrialSAIA} = require(path.join(__dirname,'../DataBase/DataTrialSAIA'))
const setupLicense = require(path.join(__dirname,'../DataBase/.data.js'))
/*--------------LINK BASE DE DATOS ------------------------*/
/*--------------LINK BASE DE DATOS ------------------------*/
const ImageDefault = path.join(__dirname,"../assets/imagen/business.png")
/*-----------------------------------*/

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
            preload: path.join(__dirname, "../preload.js")
        }
    });
//console.log(window_register_app)

    window_register_app.loadFile('app/RegisterApp/RegisterApp.html');

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

                         setupLicense("2026-4-5")


        console.log("reset")

        const info = {
                    "state":false,
                    "hostname":"",
                    "plataform":"",
                    "cpu":""                 
                }
        let data = JSON.stringify(info);
        fs.writeFile(path.join(__dirname,"../.config.json"),data, function (err) {
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
    PasswordMaster TEXT NOT NULL,                -- Contraseña
    Permission TEXT NOT NULL,              -- Permisos del usuario
    Date_Created DATE NOT NULL,
    Time_Created TIME NOT NULL,
    Time_Deleted DATE                        -- Fecha de eliminación lógica
)`);

  await DB.crearTabla(`CREATE TABLE User_Session (
    Session_ID TEXT PRIMARY KEY,
    User_Key TEXT NOT NULL,                -- Referencia a la Key de la tabla User
    Event_Type TEXT NOT NULL,              -- 'LOGIN' o 'LOGOUT'
    Date_Created DATE NOT NULL,
    Time_Created TIME NOT NULL,
    FOREIGN KEY (User_Key) REFERENCES User(Key)
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
    Birthdate TEXT,
    Status TEXT,
    Age TEXT UNICODE,
    Id_user TEXT UNIQUE,                       -- Relación con la tabla User
    Date_Created DATE NOT NULL,
    Time_Created TIME NOT NULL,
    Time_Deleted DATE,                       -- Fecha de eliminación lógica
    FOREIGN KEY (Id_user) REFERENCES User(Key) -- Clave foránea
)`);


// Tabla Instructor
await DB.crearTabla(`CREATE TABLE Instructor (
    Key TEXT PRIMARY KEY,           -- Clave primaria
    Name TEXT NOT NULL,             -- Nombre del empleado
    Cod_id TEXT NOT NULL UNIQUE,    -- Código único del empleado
    Address TEXT,                   -- Dirección
    Tlf TEXT,                       -- Teléfono
    E_mail TEXT,             -- Correo electrónico único
    Image TEXT,
    Age INTEGER,                    -- Corregido: 'UNICODE' no existe. Se cambió a INTEGER.
    Status TEXT,
    Specialty TEXT,
    Certifications TEXT,
    Date_Created DATE NOT NULL,
    Time_Created TIME NOT NULL,
    Time_Deleted DATE                 -- Fecha de eliminación lógica
)`);
//Tabla Alumno

await DB.crearTabla(`CREATE TABLE Student (
    Key TEXT PRIMARY KEY,
    Id_curs TEXT NOT NULL,
    Name TEXT NOT NULL,
    Cod_id TEXT NOT NULL UNIQUE,
    Age TEXT,
    Address TEXT,
    Tlf TEXT,
    Birthdate TEXT,
    E_mail TEXT UNIQUE,
    Image TEXT,
    Name_Representative TEXT,
    Cod_id_Representative TEXT,
    Tlf_Representative TEXT,
    E_mail_Representative TEXT,
    Date_Created DATE NOT NULL,
    Time_Created TIME NOT NULL,
    Time_Deleted DATE,
    FOREIGN KEY (Id_curs) REFERENCES Course(Key) 
)`);

//Tabla Curso
  await DB.crearTabla(`CREATE TABLE Course (
    Key TEXT PRIMARY KEY,                 -- UUID
    Name TEXT NOT NULL UNIQUE,            -- Nombre del curso
    Description TEXT,                     -- Descripción
    Instructor_ID TEXT NOT NULL,          -- Relación UUID Instructor
    Days TEXT NOT NULL,                   -- "Lun,Mar"
    Start_Time TIME NOT NULL,             -- "00:00"
    End_Time TIME NOT NULL,               -- "00:00"
    Duration_Value INTEGER NOT NULL,      -- 2
    Duration_Unit TEXT NOT NULL,          -- "Semanas"
    Capacity INTEGER DEFAULT 0,           -- Cupo
    Cost TEXT,                            -- "20"
    Has_Evaluation BOOLEAN DEFAULT 0,     -- 1 o 0
    Has_Certificate BOOLEAN DEFAULT 0,    -- 1 o 0
    Status TEXT DEFAULT 'Activo',
    Date_Created DATE NOT NULL,
    Time_Created TIME NOT NULL,
    Time_Deleted DATE                     -- Para borrado lógico
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
  
      if(result.canceled==false){

               window_register_app.webContents.send("Imagen-user-select",result.filePaths[0]);

      }
      
      if(result.canceled==true){

                window_register_app.webContents.send("Imagen-user-select",ImageDefault);

      }

      }).catch(err => {
        console.log(err);
      });



 })
/*--------------SELECCIONAR IMAGEN USER----------------------------*/


/*******CREA LA BASE DE DATOS SI NO ESTA Y SE CONECTA****************/
async function Adding_data_Admin_data(data){
    
    const ID_USER = uuidv4();
    const ID_EMPLOYEE = uuidv4();

    // Iniciamos la conexión
    DB.conectar();

    // Retornamos la promesa para poder encadenar .then() y .catch() afuera si es necesario
    return Promise.all([
        // Inserción en tabla User
        DB.crear(
            `INSERT INTO User (key, Username, Password, PasswordMaster, Permission, Date_Created, Time_Created) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [ID_USER, data.User.usuario, data.User.clave, data.User.Mclave, 'Administrador', data.fecha, data.hora]
        ),
        // Inserción en tabla Employee (Ajustado a 12 columnas para que coincida con los 12 valores)
        DB.crear(
            `INSERT INTO Employee (Key, Name, Cod_id, Address, Tlf, Age, E_mail, Birthdate, Image, Status, Id_user, Date_Created, Time_Created) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
                "Activo",
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


ipcMain.on('message-campos-vacios', async (event,text) => {

    dialog.showMessageBox({
      title: 'Notificación',
      type:'question',
      message: text,
      icon: 'info',
      buttons: ['Aceptar'],
      defaultId: 0,
      cancelId: 1,
      noLink: true
    }).then(result => {
      console.log(result.response);
    }).catch(err => {
      console.log(err);
    });



})

console.log(path.join(__dirname,"../.config.json"))

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
        
        await Adding_data_Admin_data(data).then(()=>{
       
            fs.writeFile(path.join(__dirname,"../.config.json"),obj, function(err){
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


/********************************************************************************************/


async function Adding_data_Admin_trial(){
    
    const ID_USER = uuidv4();
    const ID_EMPLOYEE = uuidv4();

    // Iniciamos la conexión
    DB.conectar();

    // Retornamos la promesa para poder encadenar .then() y .catch() afuera si es necesario
    return Promise.all([
        // Inserción en tabla User
        DB.crear(
            `INSERT INTO User (key, Username, Password, PasswordMaster, Permission, Date_Created, Time_Created) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [ID_USER, "Admin", "123456789", "123456789", 'Administrador', "0/0/0000","00-00"]
        ),
        // Inserción en tabla Employee (Ajustado a 12 columnas para que coincida con los 12 valores)
        DB.crear(
            `INSERT INTO Employee (Key, Name, Cod_id, Address, Tlf, Age, E_mail, Birthdate, Image, Status, Id_user, Date_Created, Time_Created) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
             [  
             ID_EMPLOYEE, 
               "TrialNombreAdmin", 
                "1010101010", 
                "TrialWord", 
                "01014577854", 
                "200",
                "Trial@mail.com", 
                "00/00/0000", 
                ImageDefault,
                "Activo",
                ID_USER, 
                "00/0/0000", 
                "00-00"
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


ipcMain.on('Activate-system-trial', async (event,data) => { 

let adminTrial=false
let DBTrial=false
await Adding_data_Admin_trial().then((result)=>{


adminTrial=result.success;

}).catch((err)=>{
    console.log(err)
})
await DataTrialSAIA().then((result)=>{

DBTrial=result.success;


}).catch((err)=>{
    console.log(err)
})


if(adminTrial==true  && DBTrial==true){


    dialog.showMessageBox({
          title: 'Notificación',
          type:'info',
          message: "DATOS DE PRUEBA CARGADOS 'Usuario: Admin | Clave: 123456789'",
          icon: 'info',
          buttons: ['Aceptar'],
          defaultId: 0,
          cancelId: 1,
          noLink: true
    }).then(result => {
      //console.log(result.response);
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
        
            fs.writeFile(path.join(__dirname,"../.config.json"),obj, function(err){
                    if (err) throw err;

                    //console.log('Saved data install!');

                     window_register_app.webContents.send("Completed-Saving-data");
                     setTimeout(()=>{

                        app.relaunch();
                        app.quit();

                     },3000)
                    
            });

    }).catch(err => {
      console.log(err);
    });

}

})