
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
const {GetdataStudent} = require(path.join(__dirname,'../DB_controls/Student'));
/*---------------------------------------------------------------*/

let window_Info_student;
let Key_Student=null;
module.exports = function Info_student(parentWindow,key) {
  window_Info_student = new BrowserWindow({
        width:630,
        height:490,
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

    window_Info_student.loadFile('app/section_main/Info_Student.html');

    // Herramientas de desarrollo
      //window_Info_student.webContents.openDevTools();

    // Bloquear nuevas ventanas (Forma moderna)
    window_Info_student.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    window_Info_student.once('ready-to-show', () => {
        window_Info_student.show();
    });

    Key_Student=key

}


ipcMain.on("Get-data-student-info",async(event,data)=>{

  //  console.log("Get-data-student-info")
  let result = await GetdataStudent(Key_Student)
  console.log(result)

   window_Info_student.webContents.send("data-student-information",result);


})


