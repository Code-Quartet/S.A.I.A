
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
const ImageDefault = path.join(__dirname,"../../assets/imagen/ImageLogin3.png")
/*---------------------------------------------------------------*/
const {SelectInstructor, UpdateInstructor} = require(path.join(__dirname,'../../src/database_controls/Instructor'));
/*---------------------------------------------------------------*/

let window_edit_instructor;
let key_Instructor=null
module.exports = function Edit_instructor(parentWindow,key) {
  window_edit_instructor = new BrowserWindow({
    width:480,
        height:540,
        maxWidth:480,    
        maxHeight:540,
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

    window_edit_instructor.loadFile('src/section_main/Edit_instructor.html');

    key_Instructor=key;

    // Herramientas de desarrollo
    //window_edit_instructor.webContents.openDevTools();

    // Bloquear nuevas ventanas (Forma moderna)
    window_edit_instructor.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    window_edit_instructor.once('ready-to-show', () => {
        window_edit_instructor.show();
    });

}


ipcMain.on("get-data-instructor",async (event,data)=>{

    let result = await SelectInstructor(key_Instructor)
   // console.log(result)
    window_edit_instructor.webContents.send("data-instructor",result)

})

ipcMain.on("Select-update-imagen-instructor",(event,data)=>{

 dialog.showOpenDialog(window_edit_instructor,{
        title: 'Seleccionar archivo',
        buttonLabel: 'Abrir',
        filters: [
          { name: 'Imágenes', extensions: ['jpg', 'png', 'gif','jpeg'] }
        ],
        properties: ['openFile']
      }).then(result => {
        
      if(result.canceled==false){

          window_edit_instructor.send("Image-select-update-instructor",result.filePaths[0]);
      }
      
      if(result.canceled==true){

          window_edit_instructor.send("Image-select-nupdate-instructor",ImageDefault);
      }

      }).catch(err => {

        console.log(err);
        
      });


})




ipcMain.on("Save-data-update-instructor",async(event,data)=>{

console.log(data)
 await UpdateInstructor(data.key,data).then((result)=>{
       
       console.log(result)
      window_edit_instructor.webContents.send("open-modal-update-instructor");
        
      }).catch((error)=>{
        
        console.log("ERROR DATA SAVE REGISTRO",error)

      })
})