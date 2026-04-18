const {app, BrowserWindow, Menu, MenuItem, ipcMain, dialog, Notification } = require('electron');
const path = require('path')
const fs = require('fs')
const os_system = require('os')
const { v4: uuidv4 } = require('uuid');
/*-------------------------------------*/
const SAIADB = require(path.join(__dirname, '../../src/database_controls/SAIA_manager.js'));
const DB = new SAIADB(path.join(__dirname, '../../database/SAIA.db'));
/*------------------------------------------*/

/*---------------------------------------------------------------*/
const {SelectInstructor, UpdateInstructor} = require(path.join(__dirname,'../../src/database_controls/Instructor'));
/*---------------------------------------------------------------*/

let window_RepairApp;



module.exports = function RepairApp(parentWindow) {
  window_RepairApp = new BrowserWindow({
        width:590,
        height:230,
        resizable:false, 
        frame:false,
        transparent:true,
       center:true,
        modal: true,
        parent: parentWindow, // Si quieres que sea modal, necesita un padre
        icon: path.join(__dirname, '../../build/favicon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, "../preload.js")
        }
    });

    window_RepairApp.loadFile('src/section_main/RepairApp.html');

    // Herramientas de desarrollo
    //window_RepairApp.webContents.openDevTools();

    // Bloquear nuevas ventanas (Forma moderna)
    window_RepairApp.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    window_RepairApp.once('ready-to-show', () => {
        window_RepairApp.show();
    });

}

