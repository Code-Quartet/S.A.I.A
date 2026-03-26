
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
const Login_password_master =  require(path.join(__dirname,'./LoginMaster'));
/*---------------------------------------------------------------*/
/*---------------------------------------------------------------*/

let window_login_password_master;
let objAction=null;
let parent=null;
module.exports = function AlertDeletedPermanet(parentWindow,obj) {
  window_login_password_master = new BrowserWindow({
        width: 520,
        height: 250,
        resizable: true,
        frame: false,
        transparent: true,
        modal:true,  
        parent: parentWindow,
        icon: path.join(__dirname, '../favicon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, "../preload.js")
        }
    });

    window_login_password_master.loadFile('app/section_main/AlertDeletedPermanet.html');

    // Herramientas de desarrollo
    //window_login_password_master.webContents.openDevTools();

    // Bloquear nuevas ventanas (Forma moderna)
    window_login_password_master.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    window_login_password_master.once('ready-to-show', () => {
        window_login_password_master.show();
    });

    objAction=obj
    parent=parentWindow

    console.log("obj-action",objAction)

}

ipcMain.on("Open-password-master",(event,data)=>{

        
        Login_password_master(null,objAction)

})

ipcMain.on("Close-alert-system",(event,key)=>{

        console.log("Close-alert-system")
        setTimeout(()=>{

                window_login_password_master.webContents.send("Alert-Close-system")
        },4000)

})



//sms-operation-pass-ok