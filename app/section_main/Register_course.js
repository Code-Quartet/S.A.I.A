
const {app, BrowserWindow, Menu, MenuItem, ipcMain, dialog, Notification } = require('electron');
const path = require('path')
const fs = require('fs')
const os_system = require('os')
const { v4: uuidv4 } = require('uuid');
/*-------------------------------------*/
const SAIADB = require(path.join(__dirname,'../DataBase/SAIA_manager.js'))
const DB = new SAIADB(path.join(__dirname,'../DataBase/SAIA.db'));
/*--------------LINK BASE DE DATOS ------------------------*/
/*---------------------------------------------------------------*/
const {insertarCurso} = require(path.join(__dirname,'../DB_controls/Course'))
/*---------------------------------------------------------------*/

let window_register_course;

module.exports = function Register_course(parentWindow) {
  window_register_course = new BrowserWindow({
        width:550,
        height:540,
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

    window_register_course.loadFile('app/section_main/Register_course.html');

    // Herramientas de desarrollo
   window_register_course.webContents.openDevTools();

    // Bloquear nuevas ventanas (Forma moderna)
    window_register_course.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    window_register_course.once('ready-to-show', () => {
        window_register_course.show();
    });

}

ipcMain.on("Campo-usuario-vacio",async(event,data)=>{

      dialog.showMessageBox({
        title: 'Notificación',
        type:'none',
        message: 'Porfavor Complete los Campos',
        icon: 'info',
        buttons: ['Aceptar'],
        defaultId: 0,
        cancelId: 1,
        noLink: true
      }).then(result => {
        

      }).catch(err => {
        console.log(err);
      });

})
ipcMain.on("save-new-data-course",async(event,data)=>{

      await insertarCurso(data).then((resutl)=>{

      dialog.showMessageBox({
        title: 'Notificación',
        type:'none',
        message: 'Nombre de Usuario Actualizado',
        icon: 'info',
        buttons: ['Aceptar'],
        defaultId: 0,
        cancelId: 1,
        noLink: true
      }).then(result => {
        //console.log(result.response);
        window_register_course.send("close-window-updane-user")

      }).catch(err => {
        console.log(err);
      });

})
.catch((err)=>{

    console.log("ERROR",err)
})

})