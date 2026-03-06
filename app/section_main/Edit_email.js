
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
const {UpdateEmail} = require(path.join(__dirname,'../DB_controls/User'))
/*---------------------------------------------------------------*/

let window_edit_email;
let ID_User="";
module.exports = function Edit_email(parentWindow,id) {
  window_edit_email = new BrowserWindow({
        width:680,
        height:240,
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

  ID_User = id;
//console.log(window_edit_email)

    window_edit_email.loadFile('app/section_main/Edit_email.html');

    // Herramientas de desarrollo
   // window_edit_email.webContents.openDevTools();

    // Bloquear nuevas ventanas (Forma moderna)
    window_edit_email.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    window_edit_email.once('ready-to-show', () => {
        window_edit_email.show();
    });

}

ipcMain.on("Campo-email-vacio",async(event,data)=>{

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
ipcMain.on("save-new-email",async(event,data)=>{
/*
console.log("id-email",ID_User)
console.log("id-email",data)
*/
await UpdateEmail(ID_User,data).then((resutl)=>{

        dialog.showMessageBox({
              title: 'Notificación',
              type:'none',
              message: 'Correo de Usuario Actualizado',
              icon: 'info',
              buttons: ['Aceptar'],
              defaultId: 0,
              cancelId: 1,
              noLink: true

        }).then(result => {
      
            window_edit_email.send("close-window-updane-email")

        }).catch(err => {

            console.log(err);

        });

})
.catch((err)=>{

    console.log("ERROR",err)
})

})