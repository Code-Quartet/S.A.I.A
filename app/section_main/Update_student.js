
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
const {GetListDataCourseStudent,GetdataStudent,UpdateStudent} = require(path.join(__dirname,'../DB_controls/Student'));
/*---------------------------------------------------------------*/

let window_Update_studient;
let key_student=""
module.exports = function Update_studient(parentWindow,key){

  window_Update_studient = new BrowserWindow({
        width:990,
        height:530,
      // modal: true,
        resizable:false, 
        frame:false,
      //  parent: parentWindow, // Si quieres que sea modal, necesita un padre
        show: false, // Mejor oculto hasta que esté listo
        icon: path.join(__dirname, '../favicon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, "../preload.js")
        }
    });

    window_Update_studient.loadFile('app/section_main/Update_student.html');

    // Herramientas de desarrollo
  //window_Update_studient.webContents.openDevTools();

    // Bloquear nuevas ventanas (Forma moderna)
    window_Update_studient.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    window_Update_studient.once('ready-to-show', () => {
        window_Update_studient.show();
    });

        key_student=key

}

ipcMain.on("Get-data-list-course-student-update",async(event,data)=>{

  let result = await GetListDataCourseStudent()

   window_Update_studient.webContents.send("data-list-course-student-update",result);

})



ipcMain.on("Get-data-student-update",async(event,data)=>{

      //console.log("Get-data-student-update")

      let result = await GetdataStudent(key_student)

      window_Update_studient.webContents.send("data-student-information",result);


})

ipcMain.on("select-Image-new-student-update",(even,data)=>{

   dialog.showOpenDialog(window_Update_studient,{
        title: 'Seleccionar archivo',
        buttonLabel: 'Abrir',
        filters: [
          { name: 'Imágenes', extensions: ['jpg', 'png', 'gif','jpeg'] }
        ],
        properties: ['openFile']
      }).then(result => {
        
      if(result.canceled==false){

           window_Update_studient.webContents.send('Image-select-new-student-update',result.filePaths[0]);
      }
      
      if(result.canceled==true){

          window_Update_studient.webContents.send('Image-select-new-student-update',ImageDefault);
      }

      }).catch(err => {

        console.log(err);
        
      });
})


ipcMain.on("Register-update-data-student",(even,data)=>{
   
    console.log("Register-update-data-student",data)

    UpdateStudent(data.Key,data).then((result)=>{
                  
       window_Update_studient.webContents.send("Open-modal-message-student-update")
          
          //console.log("Open-modal-message-student-update",result)
    }).catch((error)=>{
            
        console.log("ERROR DATA SAVE REGISTRO",error)

    })

})
