
const {app, BrowserWindow, Menu, MenuItem, ipcMain, dialog, Notification } = require('electron');
const path = require('path')
const fs = require('fs')
const os_system = require('os')


/*------------Modulos externos----------------*/
const Register_App = require(path.join(__dirname,'./RegisterApp'));
/*------------Modulos externos----------------*/


/*--------select-system-init------------*/
function Select_system_type(){

createWindow()
//Register_App()

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




/********************************************************************************************/
// Evento cuando la app está lista para crear ventanas
app.on('ready',  () => {

  Select_system_type()

});

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