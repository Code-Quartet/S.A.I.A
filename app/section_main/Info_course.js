
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
const {InformationCourseSelect} = require(path.join(__dirname,'../DB_controls/Course'))
/*---------------------------------------------------------------*/

let window_info_course;
let Key_course="";
module.exports = function Edit_course(parentWindow,key) {


  window_info_course = new BrowserWindow({
        width:540,
        height:476,
       resizable:false, 
        frame:false,
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

  Key_course=key

    window_info_course.loadFile('app/section_main/Info_course.html');

    // Herramientas de desarrollo
  // window_info_course.webContents.openDevTools();

    // Bloquear nuevas ventanas (Forma moderna)
    window_info_course.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    window_info_course.once('ready-to-show', () => {
        window_info_course.show();
    });

}

ipcMain.on("get-data-course-info",async(event,data)=>{

    //console.log("get-data-course-info",Key_course)

    let result = await InformationCourseSelect(Key_course)

// console.log(">get-data-course-info",result)

   window_info_course.webContents.send("data-course-info",result)

})
