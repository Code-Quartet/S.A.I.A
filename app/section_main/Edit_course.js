
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
//const {UpdateUsername} = require(path.join(__dirname,'../DB_controls/User'))
/*---------------------------------------------------------------*/

let window_edit_course;

module.exports = function Edit_course(parentWindow) {
  window_edit_course = new BrowserWindow({
        width:550,
        height:580,
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

    window_edit_course.loadFile('app/section_main/Edit_course.html');

    // Herramientas de desarrollo
    window_edit_course.webContents.openDevTools();

    // Bloquear nuevas ventanas (Forma moderna)
    window_edit_course.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    window_edit_course.once('ready-to-show', () => {
        window_edit_course.show();
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
ipcMain.on("save-new-username",async(event,data)=>{

      await UpdateUsername(ID_User,data).then((resutl)=>{

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
        window_edit_course.send("close-window-updane-user")

      }).catch(err => {
        console.log(err);
      });

})
.catch((err)=>{

    console.log("ERROR",err)
})

})