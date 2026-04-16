
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
const {GetListDataCourseStudent,GetdataStudent,UpdateStudent} = require(path.join(__dirname,'../../src/database_controls/Student'));
/*---------------------------------------------------------------*/
const ImageDefault = path.join(__dirname,"../../assets/imagen/ImageLogin3.png")
/*---------------------------------------------------------------*/
/*-------------------------------------*/
let window_Update_studient;
let key_student=""
module.exports = function Update_studient(parentWindow,key){

  window_Update_studient = new BrowserWindow({
           width:600,
        height:530,
        resizable:false,
        frame:false,
        movable: true,
        modal: true,
        parent:parentWindow,
        show: false, // Mejor oculto hasta que esté listo
        icon: path.join(__dirname, '../../build/favicon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, "../preload.js")
        }
    });

    window_Update_studient.loadFile('src/section_main/Update_studentV5.html');

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

          //window_Update_studient.webContents.send('Image-select-new-student-update',ImageDefault);
      }

      }).catch(err => {

        console.log(err);
        
      });
})

ipcMain.on("Register-update-data-student", (event, data) => {
    console.log("Recibiendo datos para actualizar:", data);

    // Es buena práctica verificar si la ventana aún existe
    if (!window_Update_studient || window_Update_studient.isDestroyed()) {
        console.error("La ventana de actualización no existe o fue cerrada.");
        return;
    }

    UpdateStudent(data.key,data)
        .then((result) => {

            if(result.success==false){

                message(result.message)

            }else {
                
        window_Update_studient.webContents.send("Open-modal-message-student-update");
      
            }
        })
        .catch((error) => {
           

            console.error("ERROR AL GUARDAR REGISTRO:", error);

        });
});


function message(sms){
   dialog.showMessageBox(window_Update_studient,{
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
