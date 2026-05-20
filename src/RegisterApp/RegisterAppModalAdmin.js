
const {app, BrowserWindow, Menu, MenuItem, ipcMain, dialog, Notification } = require('electron');
const path = require('path')
const fs = require('fs')
const os_system = require('os')
const { v4: uuidv4 } = require('uuid');
/*-------------------------------------*/
const PathList = require(path.join(__dirname,'../PathList'));
/*--------------------------------*/
const SAIADB = require(path.join(__dirname, '../database_controls/SAIA_manager.js'));
const DB = new SAIADB(PathList.dbPath);
/*------------------------------------*/
const {LimpiarBaseDeDatos, DataTrialSAIA} = require(path.join(__dirname,'../database_controls/DataTrialSAIA'))
/*--------------------------------------*/
const config = path.join(PathList.configPath)
/*------------------------------------*/
const setupLicense = require(path.join(__dirname,'../database_controls/.data.js'))
/*--------------LINK BASE DE DATOS ------------------------*/
const ImageDefault = path.join(__dirname,"../../assets/imagen/ImageLogin3.png")
const ImageDefaultDoc = path.join(__dirname,"../../assets/imagen/CeddulaFalsa.png")
/*-----------------------------------*/

let window_Register_App_Modal_Admin;

module.exports = function Register_App_Modal(parentWindow) {
  window_Register_App_Modal_Admin = new BrowserWindow({
        width:980,
        height:550,
        modal:false,
        resizable:true,
        parent: parentWindow,
        transparent:true,
        frame:false, //oculta bara de botones menu
        icon: path.join(__dirname, '../../build/favicon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, "../preload.js")
        }
    });

   window_Register_App_Modal_Admin.loadFile('src/RegisterApp/RegisterAppModalAdmin.html');

    // Herramientas de desarrollo
 //window_Register_App_Modal_Admin.webContents.openDevTools();

    // Bloquear nuevas ventanas (Forma moderna)
    window_Register_App_Modal_Admin.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    window_Register_App_Modal_Admin.once('ready-to-show', () => {
        window_Register_App_Modal_Admin.show();
    });

  

};

/*--------------SELECCIONAR IMAGEN USER----------------------------*/
ipcMain.on("select-image-user-admin-app",(event,type) => {
 
      dialog.showOpenDialog(window_Register_App_Modal_Admin,{
        title: 'Seleccionar archivo',
        buttonLabel: 'Abrir',
        filters: [
          { name: 'Imágenes', extensions: ['jpg', 'png', 'gif','jpeg'] }
        ],
        properties: ['openFile']
      }).then(result => {
        //console.log(result.filePaths[0]);
  
      if(result.canceled==false){

           window_Register_App_Modal_Admin.webContents.send("Imagen-user-admin-select",{type:type,path:result.filePaths[0]});

      }
      
      if(result.canceled==true){


      }

      }).catch(err => {
        console.log(err);
      });
})
/*-*/

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
             VALUES (?, ?, ?, ?, ?, Date('now'), Time('now'))`,
            [ID_USER, data.User.usuario, data.User.clave, data.User.Mclave,'Administrador']
        ),
        // Inserción en tabla Employee (Ajustado a 12 columnas para que coincida con los 12 valores)
        DB.crear(
            `INSERT INTO Employee (Key, Name, Cod_id, Address, Tlf, Age, E_mail, Birthdate, Image, Status, Id_user, Date_Created, Time_Created) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, Date('now'), Time('now'))`,
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
                window_Register_App_Modal_Admin.webContents.send("Saving-data-default-user");

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
       
            fs.writeFile(config,obj, function(err){
                    if (err) throw err;

               window_Register_App_Modal_Admin.webContents.send("Completed-Saving-data");


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


