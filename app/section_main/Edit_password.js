
const {app, BrowserWindow, Menu, MenuItem, ipcMain, dialog, Notification } = require('electron');
const path = require('path')
const fs = require('fs')
const os_system = require('os')
const { v4: uuidv4 } = require('uuid');
/*-------------------------------------*/
const SAIADB = require(path.join(__dirname,'../DataBase/SAIA_manager.js'))
const DB = new SAIADB(path.join(__dirname,'../DataBase/SAIA.db'));
/*--------------LINK BASE DE DATOS ------------------------*/
/*-------------SYSTEM MESSAGE----------------------------------------*/
const {InfoMessage,ErrorMessage} = require(path.join(__dirname,'./Message_system'));
/*-------------SYSTEM MESSAGE----------------------------------------*/
/*---------------------------------------------------------------*/
const {UpdatePassword} = require(path.join(__dirname,'../DB_controls/User'))
/*---------------------------------------------------------------*/

let window_edit_password;
let ID_user="";
module.exports = function Edit_password(parentWindow,iduser) {
  window_edit_password = new BrowserWindow({
        width:470,
        height:430,
        modal: true,
        parent: parentWindow, // Si quieres que sea modal, necesita un padre
        show: false, // Mejor oculto hasta que esté listo
      resizable:false,
        frame:false,              
        icon: path.join(__dirname, '../favicon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, "../preload.js")
        }
    });

  ID_user=iduser;
console.log("Isuerpass",iduser)

    window_edit_password.loadFile('app/section_main/Edit_password.html');

    // Herramientas de desarrollo
    window_edit_password.webContents.openDevTools();

    // Bloquear nuevas ventanas (Forma moderna)
    window_edit_password.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    window_edit_password.once('ready-to-show', () => {
        window_edit_password.show();
    });

}


ipcMain.on("sms-alert-system-pass",(event,sms)=>{

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
ipcMain.on("update-password-user",(event,data)=>{

    UpdatePassword(ID_user, data.afterPass, data.newPass).then((result)=>{

            //console.log(result)
            if(result.success==true){

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
                    }).then(result => {
                      //console.log(result.response);
                      window_edit_password.send("sms-operation-pass-ok")

                    }).catch(err => {
                      console.log(err);
                    });

            }
            if(result.success==false){
                ErrorMessage("Error",result.message)
            }

    }).catch((error)=>{

            console.log("Error de funcion cambio de clave")
    })
})


//sms-operation-pass-ok