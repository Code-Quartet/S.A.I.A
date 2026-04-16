
const {app, BrowserWindow, Menu, MenuItem, ipcMain, dialog, Notification } = require('electron');
const path = require('path')
const fs = require('fs')
const os_system = require('os')
const { v4: uuidv4 } = require('uuid');
/*-------------------------------------*/
const SAIADB = require(path.join(__dirname, '../../src/database_controls/SAIA_manager.js'));
const DB = new SAIADB(path.join(__dirname, '../../database/SAIA.db'));
/*------------------------------------------*/

/*--------------LINK BASE DE DATOS ------------------------*/
/*---------------------------------------------------------------*/
const {UpdateUsername} = require(path.join(__dirname,'../../src/database_controls/User'))
/*---------------------------------------------------------------*/

let window_edit_user;
let ID_User="";

module.exports = function Edit_user(parentWindow,dataID) {
  window_edit_user = new BrowserWindow({
        width:500,
        height:260,
        modal: true,
        parent: parentWindow, // Si quieres que sea modal, necesita un padre
        show: false, // Mejor oculto hasta que esté listo
        icon: path.join(__dirname, '../../build/favicon.ico'),
        resizable:false,
       frame:false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, "../preload.js")
        }
    });


  ID_User=dataID;


    window_edit_user.loadFile('src/section_main/Edit_user.html');

    // Herramientas de desarrollo
   //window_edit_user.webContents.openDevTools();

    // Bloquear nuevas ventanas (Forma moderna)
    window_edit_user.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    window_edit_user.once('ready-to-show', () => {
        window_edit_user.show();
    });

}

ipcMain.on("Campo-usuario-vacio-btn",async(event,text)=>{

    dialog.showMessageBox(window_edit_user,{
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


ipcMain.on("Campo-usuario-vacio-click",async(event,text)=>{

    dialog.showMessageBox(window_edit_user,{
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

      window_edit_user.send("close-window-updane-user")


    })
    .catch((err)=>{

        console.log("ERROR",err)
    })

})