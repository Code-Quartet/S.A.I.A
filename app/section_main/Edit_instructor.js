
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

let window_edit_instructor;

module.exports = function Edit_instructor(parentWindow) {
  window_edit_instructor = new BrowserWindow({
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

    window_edit_instructor.loadFile('app/section_main/Edit_instructor.html');

    // Herramientas de desarrollo
    window_edit_instructor.webContents.openDevTools();

    // Bloquear nuevas ventanas (Forma moderna)
    window_edit_instructor.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    window_edit_instructor.once('ready-to-show', () => {
        window_edit_instructor.show();
    });

}

