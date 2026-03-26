
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
const {UpdatePasswordMaster} = require(path.join(__dirname,'../DB_controls/User'))
/*---------------------------------------------------------------*/

let window_login_password_master;
let objAction=null;

module.exports = function Login_password_master(parentWindow,obj) {
  window_login_password_master = new BrowserWindow({
        width: 560,
        height: 180,
        //resizable: false,
        frame: false,
        transparent: true,
        modal:true,  
        //parent: parentWindow,
        icon: path.join(__dirname, '../favicon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, "../preload.js")
        }
    });

    window_login_password_master.loadFile('app/section_main/LoginMaster.html');

    // Herramientas de desarrollo
 // window_login_password_master.webContents.openDevTools();

    // Bloquear nuevas ventanas (Forma moderna)
    window_login_password_master.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    window_login_password_master.once('ready-to-show', () => {
        window_login_password_master.show();
    });

    objAction=obj

}

ipcMain.on("verify_master_password",async (event,PasswordMaster)=>{

  await loginMaster(objAction.key, PasswordMaster, objAction.permission).then((result)=>{
    
    let objeto_result = {
      action:objAction.method.action,
      key:objAction.method.key,
      sms:result
    }

    window_login_password_master.webContents.send("message-password-master",objeto_result)


  }).catch((err)=>{

    console.log(err)

  })
/*--------------------------*/
})

async function loginMaster(key, pass, permission) {
    try {
        // 1. Buscamos al usuario por su Key
        //const query = "SELECT * FROM User WHERE Key = ? AND Time_Deleted IS NULL";
        const query = "SELECT PasswordMaster, Permission FROM User WHERE Key = ?";
        const user = await DB.buscar(query, [key]);

        //console.log(user)

        //{ PasswordMaster: '123456789', Permission: 'Administrador' }

        if(user.PasswordMaster==pass && user.Permission==permission){

          return {
                success: true,
                message: "Acceso concedido"
            };

        }
        else {
            return {
              success: false, message: "Credenciales incorrectos." 
            };
        }

    } catch (error) {
        console.error("Error en el proceso de login:", error);
        return { success: false, message: "Error interno del servidor." };
    }
}

//sms-operation-pass-ok