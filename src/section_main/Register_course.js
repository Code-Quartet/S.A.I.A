
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
const {GetAllKeyNameInnstructor,InsertCourse} = require(path.join(__dirname,'../../src/database_controls/Course'))
/*---------------------------------------------------------------*/

let window_register_course;

module.exports = function Register_course(parentWindow) {
  window_register_course = new BrowserWindow({
        width:560,
        height:580,
        resizable:false, 
        frame:false,
        movable: true,
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

    window_register_course.loadFile('src/section_main/Register_course.html');

    // Herramientas de desarrollo
   //window_register_course.webContents.openDevTools();

    // Bloquear nuevas ventanas (Forma moderna)
    window_register_course.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    window_register_course.once('ready-to-show', () => {
        window_register_course.show();
    });

     window_register_course.setAutoHideMenuBar(true);

}

ipcMain.on("Get-list-instructor",async(event,data)=>{

let result = await GetAllKeyNameInnstructor() 
 window_register_course.webContents.send("Data-list-intructor",result)

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

ipcMain.on("save-new-data-course",async(event,data)=>{

    await InsertCourse(data).then((resutl)=>{

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

      window_register_course.webContents.send("open-modal-register-course")
}
})
.catch((err)=>{

    console.log("ERROR",err)
})

})

/****
{
    "nombre": "Computación",
    "descripcion": "Todo sobre computacion",
    "instructor": "617dda98-9b56-4003-94d2-20aa67d571c8",
    "dias": [
        "Lun",
        "Mie",
        "Vie"
    ],
    "hora_inicio": "07:00",
    "hora_fin": "12:00",
    "duracion_valor": "4",
    "duracion_unidad": "Semanas"
}******/