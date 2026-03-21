
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
const {SelectInstructor, UpdateInstructor} = require(path.join(__dirname,'../DB_controls/Instructor'));
/*---------------------------------------------------------------*/

let window_Info_instructor;

let key_Instructor=null;
module.exports = function Info_instructor(parentWindow,id) {
  window_Info_instructor = new BrowserWindow({
      width:495,
        height:450,
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

  key_Instructor=id

    window_Info_instructor.loadFile('app/section_main/Info_instructor.html');

    // Herramientas de desarrollo
   //window_Info_instructor.webContents.openDevTools();

    // Bloquear nuevas ventanas (Forma moderna)
    window_Info_instructor.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    window_Info_instructor.once('ready-to-show', () => {
        window_Info_instructor.show();
    });

}

ipcMain.on("get-data-instructor-info",async (event,key)=>{
    console.log(key)
    let result = await SelectInstructor(key_Instructor)
    console.log(result)
    window_Info_instructor.webContents.send("data-instructor",result)

})

/*
{
  Key: 'f657f976-1819-44dd-a4a1-9e36e87a5144',
  Name: 'Instructor10',
  Cod_id: '26',
  Address: 'Zulia Venezuela',
  Tlf: '01412578',
  E_mail: 'Instructor10@mail.com',
  Image: 'C:\\Users\\Duno Castellano\\Desktop\\S.A.I.A\\app\\assets\\imagen\\ImageLogin3.png',
  Age: 4,
  Status: 'Activo',
  Specialty: 'ING ELECTRONICA',
  Certifications: 'Computacion',
  Date: '2026-03-15',
  Time: '17:46:17',
  Time_delet: null
}
*/






