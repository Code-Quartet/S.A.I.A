
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
const {GetEmployeeWithUser,UpdateEmployee,GetEmployeesPaged} = require(path.join(__dirname,'../DB_controls/Employee'))
/*---------------------------------------------------------------*/

let window_info_employee;

let Key_employee=null;
module.exports = function Info_employee(parentWindow,id) {
  window_info_employee = new BrowserWindow({
      width:490,
        height:420,
        modal: true,
        resizable:false, 
        frame:false,
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

  Key_employee=id

    window_info_employee.loadFile('app/section_main/Info_employee.html');

    // Herramientas de desarrollo
   // window_info_employee.webContents.openDevTools();

    // Bloquear nuevas ventanas (Forma moderna)
    window_info_employee.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    window_info_employee.once('ready-to-show', () => {
        window_info_employee.show();
    });

}

ipcMain.on("get-data-employee-info",async (event,key)=>{

 let result = await GetEmployeeWithUser(Key_employee)
 window_info_employee.webContents.send("data-employee-info",result)

})









