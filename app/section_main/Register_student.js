
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
const {GetListDataCourseStudent,RegisterStudent,GetdataStudent} = require(path.join(__dirname,'../DB_controls/Student'));
/*---------------------------------------------------------------*/
/*--------------LINK BASE DE DATOS ------------------------*/
const ImageDefault = path.join(__dirname,"../assets/imagen/ImageLogin3.png")
/*---------------------------------------------------------------*/
let window_Register_student;

module.exports = function Register_student(parentWindow) {
  window_Register_student = new BrowserWindow({
        width:990,
        height:530,
      // modal: true,
        resizable:false, 
        frame:false,
        //parent: parentWindow, // Si quieres que sea modal, necesita un padre
        show: false, // Mejor oculto hasta que esté listo
        icon: path.join(__dirname, '../favicon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, "../preload.js")
        }
    });

    window_Register_student.loadFile('app/section_main/Register_StudentV3.html');

    //Herramientas de desarrollo
    //window_Register_student.webContents.openDevTools();

    // Bloquear nuevas ventanas (Forma moderna)
    window_Register_student.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    window_Register_student.once('ready-to-show', () => {
        window_Register_student.show();
    });

}


ipcMain.on("Get-data-list-course-student",async(event,data)=>{

  let result = await GetListDataCourseStudent()

  //console.log("data-list-course-student",result)
  window_Register_student.webContents.send("data-list-course-student",result);

})


ipcMain.on("get-info-course-student",async(event,data)=>{




})


ipcMain.on("select-Image-new-student",(even,data)=>{

   dialog.showOpenDialog(window_Register_student,{
        title: 'Seleccionar archivo',
        buttonLabel: 'Abrir',
        filters: [
          { name: 'Imágenes', extensions: ['jpg', 'png', 'gif','jpeg'] }
        ],
        properties: ['openFile']
      }).then(result => {
        
      if(result.canceled==false){

          window_Register_student.webContents.send("Image-select-new-student",result.filePaths[0]);
      }
      
      if(result.canceled==true){

         // window_Register_student.webContents.send("Image-select-new-student",ImageDefault);
      }

      }).catch(err => {

        console.log(err);
        
      });
})


ipcMain.on("Register-new-data-student",(even,data)=>{
   
   console.log("Register-new-data-student",data)

    RegisterStudent(data).then((result)=>{
           
          
      window_Register_student.webContents.send("Open-modal-message-student")
          
    }).catch((error)=>{
            
        console.log("ERROR DATA SAVE REGISTRO",error)

    })

 
})



