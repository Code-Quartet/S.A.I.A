
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
/*---------------------------------------------------------------*/
const {UpdateCourse,SelectUpdateCourseKey,GetAllKeyNameInnstructor} = require(path.join(__dirname,'../../src/database_controls/Course'))
/*---------------------------------------------------------------*/

let window_edit_course;
let Key_course="";
module.exports = function Edit_course(parentWindow,key) {
  window_edit_course = new BrowserWindow({
        width:560,
        height:580,
       resizable:false, 
        frame:false,
        modal: true,
        parent: parentWindow, // Si quieres que sea modal, necesita un padre
        show: false, // Mejor oculto hasta que esté listo
          icon: path.join(__dirname, '../../build/favicon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, "../preload.js")
        }
    });

  Key_course=key

    window_edit_course.loadFile('src/section_main/Edit_course.html');

    // Herramientas de desarrollo
   // window_edit_course.webContents.openDevTools();

    // Bloquear nuevas ventanas (Forma moderna)
    window_edit_course.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    window_edit_course.once('ready-to-show', () => {
        window_edit_course.show();
    });

}

ipcMain.on("Get-data-course-update",async(event,data)=>{

    let result = await SelectUpdateCourseKey(Key_course)

    window_edit_course.webContents.send("data-update-course",result)

})

ipcMain.on("Get-list-instructor-update",async(event,data)=>{

    let result = await GetAllKeyNameInnstructor() 
     window_edit_course.webContents.send("Data-list-intructor-update",result)

})


ipcMain.on("Campo-usuario-vacio",async(event,data)=>{

      dialog.showMessageBox({
            title: 'Notificación',
            type:'none',
            message: 'Porfavor Complete los Campos',
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

ipcMain.on("save-update-data-course",async(event,data)=>{

    console.log("save-update-data-course",data)
    await UpdateCourse(data.Key,data).then((resutl)=>{
  if(resutl.success==false){

    dialog.showMessageBox({
        title: 'Alerta',
        type:'warning',
        message:resutl.message,
        icon: 'warning',
        buttons: ['Aceptar'],
        defaultId: 0,
        cancelId: 1,
        noLink: true
      }).then(resutl => {
        

      }).catch(err => {
        console.log(err);
      });

        }else{
              window_edit_course.webContents.send("open-modal-register-course")
        }
    })
    .catch((err)=>{

        console.log("ERROR",err)
    })


})