
const {app, BrowserWindow, Menu, MenuItem, ipcMain, dialog, Notification } = require('electron');
const path = require('path')
const fs = require('fs')
const os_system = require('os')
const { v4: uuidv4 } = require('uuid');
const config = require(path.join(__dirname,".config.json"));

/*----------------*/
const SAIADB = require(path.join(__dirname,'./DataBase/SAIA_manager.js'))
console.log("adad",SAIADB)
const DB = new SAIADB(path.join(__dirname,'./DataBase/SAIA.db'));
/*--------------LINK BASE DE DATOS ------------------------*/
/*---------------------------------------------------------------*/
const {login_system} = require(path.join(__dirname,'./DBActions/User'))
/*---------------------------------------------------------------*/
/*------------Modulos externos----------------*/
const Register_App = require(path.join(__dirname,'./RegisterApp'));
/*------------Modulos externos----------------*/


/*--------select-system-init------------*/
function Select_system_type(){

//
if(config.state==false && config.plataform=="" && config.cpu=="" && config.hostname==""){
  console.log("register app")
  Register_App()
  //createWindow()
}

if(config.state==true && config.plataform!=="" && config.cpu!=="" && config.hostname!==""){
  console.log("Open system")

  createWindow()
}

}
/*--------select-system-init------------*/

let mainWindow;

function createWindow() {

      mainWindow = new BrowserWindow({
          width: 1028,
          height: 620,
          icon:path.join(__dirname,'/favicon.ico'),
            webPreferences:{
              nodeIntegration: false, // Deshabilita la integración de Node.js para contenido remoto
              contextIsolation: true, // Aísla el contenido del proceso principal
              preload:path.join(__dirname,'/preload.js') // Archivo de "preload" que carga antes del contenido remoto
            }
      })


      // Cargar el archivo HTML principal
      mainWindow.loadFile('app/index.html');
      
      mainWindow.webContents.openDevTools()
      mainWindow.webContents.on('new-window', (event, url) => {

        event.preventDefault(); // Evita que se abran nuevas ventanas

      });

    // Evento cuando se cierra la ventana
    mainWindow.on('closed', () => {
          mainWindow = null;
    });

}


/**************************************************************************************/
/*LOGIM SYSTEM APP*/
/*LOGIM DEL SYSTEMA APLICACION*/
ipcMain.on('Login-user-app',async(event,data) => {

     await login_system(data).then((result)=>{

        if(result!="Error"){

          mainWindow.send("Data-user-employee",result)
          console.log("result",result)

        }else{
          console.log("Credenciales incorrectas o usuario eliminado.")
        }

     })
     .catch((error) => {
        console.error("Error al insertar datos");
    })

})
/**************************************************************************************/
// Evento cuando la app está lista para crear ventanas
app.on('ready', Select_system_type, 
  Menu.setApplicationMenu(null)
  );

// Evento cuando todas las ventanas están cerradas
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Evento cuando la app se activa (solo en macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});