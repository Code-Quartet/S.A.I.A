
const {app, BrowserWindow, Menu, MenuItem, ipcMain, dialog, Notification } = require('electron');
const path = require('path')
const fs = require('fs')
const os_system = require('os')
const { v4: uuidv4 } = require('uuid');
/*-------------------------------------*/
const SAIADB = require(path.join(__dirname, '../../src/database_controls/SAIA_manager.js'));
const DB = new SAIADB(path.join(__dirname, '../../database/SAIA.db'));
/*------------------------------------------*/

const ImageDefault = path.join(__dirname,"../../assets/imagen/ImageLogin3.png")
/*---------------------------------------------------------------*/
const {InsertInstructor, DeleteInstructor} = require(path.join(__dirname,'../../src/database_controls/Instructor'));
/*---------------------------------------------------------------*/

let window_register_instructor;

module.exports = function Register_instructor(parentWindow) {
  window_register_instructor = new BrowserWindow({
        width:480,
        height:540,
        resizable:false,
        frame:false,
        movable: true,
        modal: true,
        parent: parentWindow,
        icon: path.join(__dirname, '../favicon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, "../preload.js")
        }
    });

    window_register_instructor.loadFile('src/section_main/Register_instructor.html');

    // Herramientas de desarrollo
    //window_register_instructor.webContents.openDevTools();

    // Bloquear nuevas ventanas (Forma moderna)
    window_register_instructor.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    window_register_instructor.once('ready-to-show', () => {
        window_register_instructor.show();
    });

}


ipcMain.on("Select-new-imagen-instructor",(event,data)=>{

 dialog.showOpenDialog(window_register_instructor,{
        title: 'Seleccionar archivo',
        buttonLabel: 'Abrir',
        filters: [
          { name: 'Imágenes', extensions: ['jpg', 'png', 'gif','jpeg'] }
        ],
        properties: ['openFile']
      }).then(result => {
        
      if(result.canceled==false){

          window_register_instructor.send("Image-select-new-instructor",result.filePaths[0]);
      }
      
      if(result.canceled==true){

          window_register_instructor.send("Image-select-new-instructor",ImageDefault);
      }

      }).catch(err => {

        console.log(err);
        
      });


})

ipcMain.on("Save-data-new-instructor",async(event,data)=>{

await InsertInstructor(data).then((result)=>{

if(result.success==false){

  message(result.message)
       
  
}else {
  
   window_register_instructor.webContents.send("open-modal-register-instructor");
        
}
       
     
}).catch((error)=>{
        
  console.log("ERROR DATA SAVE REGISTRO",error)

})

})


function message(sms){
   dialog.showMessageBox(window_register_instructor,{
        title: 'Alerta',
          type:'warning',
      message: sms,
      icon: 'info',
      buttons: ['Aceptar'],
      defaultId: 0,
      cancelId: 1,
      noLink: true
    })
}
