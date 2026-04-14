
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
/*-------------SYSTEM MESSAGE----------------------------------------*/
const {InfoMessage,ErrorMessage} = require(path.join(__dirname,'./Message_system'));
/*-------------SYSTEM MESSAGE----------------------------------------*/
/*---------------------------------------------------------------*/
const {UpdatePasswordMaster} = require(path.join(__dirname,'../../src/database_controls/User'))
/*---------------------------------------------------------------*/

let window_Edit_password_master;
let ID_user="";
module.exports = function Edit_password_master(parentWindow,iduser) {
  window_Edit_password_master = new BrowserWindow({
        width:470,
        height:430,
        modal: true,
        parent: parentWindow, // Si quieres que sea modal, necesita un padre
        show: false, // Mejor oculto hasta que esté listo
        resizable:false,
frame:false,    
          icon: path.join(__dirname, '../../build/favicon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, "../preload.js")
        }
    });

  ID_user=iduser;
console.log("Isuerpass",iduser)

    window_Edit_password_master.loadFile('src/section_main/Edit_password_master.html');

    // Herramientas de desarrollo
    //window_Edit_password_master.webContents.openDevTools();

    // Bloquear nuevas ventanas (Forma moderna)
    window_Edit_password_master.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    window_Edit_password_master.once('ready-to-show', () => {
        window_Edit_password_master.show();
    });

}


ipcMain.on("sms-alert-system-pass-master",(event,sms)=>{

    dialog.showMessageBox({
        title: 'Notificación',
          type:'warning',
      message: sms,
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
ipcMain.on("update-password-user-master",(event,data)=>{

   // console.log("ID_user",ID_user)

    //{ success: false, message: 'Usuario no encontrado.' }

   UpdatePasswordMaster(ID_user, data.afterPass, data.newPass).then((result)=>{

            //console.log(result)
            if(result.success==true){
/*
                dialog.showMessageBox({
                      title: 'Notificación',
                      type:'info',
                      message: result.message,
                      detail: 'Retorno al Login para establecer información',
                      icon: 'info',
                      buttons: ['Aceptar'],
                      defaultId: 0,
                      cancelId: 1,
                      noLink: true
                    }).then(result => {*/
                      //console.log(result.response);
                      window_Edit_password_master.send("sms-operation-pass-ok-master")
/*
                    }).catch(err => {
                      console.log(err);
                    });
*/
            }
            if(result.success==false){
                ErrorMessage("Error",result.message)
            }

    }).catch((error)=>{

            console.log("Error de funcion cambio de clave")
    })
})


//sms-operation-pass-ok