
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
const Login_password_master =  require(path.join(__dirname,'./LoginMaster'));
/*---------------------------------------------------------------*/
/*---------------------------------------------------------------*/

let window_Alert_trash;
let objAction=null;
let parent=null;
module.exports = function AlertDeletedPermanet(parentWindow,obj) {
  window_Alert_trash = new BrowserWindow({
        width: 520,
        height: 250,
        resizable: true,
        frame: false,
        transparent: true,
        modal:true,  
        parent: parentWindow,
        icon: path.join(__dirname, '../../build/favicon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, "../preload.js")
        }
    });

    window_Alert_trash.loadFile('src/section_main/AlertDeletedPermanet.html');

    // Herramientas de desarrollo
   //window_Alert_trash.webContents.openDevTools();

    // Bloquear nuevas ventanas (Forma moderna)
    window_Alert_trash.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    window_Alert_trash.once('ready-to-show', () => {
        window_Alert_trash.show();
    });

    objAction=obj
    parent=parentWindow

    console.log("obj-action",objAction)

}

ipcMain.on("Open-password-master",(event,data)=>{

        
        Login_password_master(null,objAction)

})

ipcMain.on("Close-alert-system",(event,key)=>{

        setTimeout(()=>{

                window_Alert_trash.webContents.send("Alert-Close-system")
       
       },4500)

})



//sms-operation-pass-ok