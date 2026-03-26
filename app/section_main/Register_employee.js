
const {app, BrowserWindow, Menu, MenuItem, ipcMain, dialog, Notification } = require('electron');
const path = require('path')
const fs = require('fs')
const os_system = require('os')
const { v4: uuidv4 } = require('uuid');
/*-------------------------------------*/
const SAIADB = require(path.join(__dirname,'../DataBase/SAIA_manager.js'))
const DB = new SAIADB(path.join(__dirname,'../DataBase/SAIA.db'));
/*--------------LINK BASE DE DATOS ------------------------*/
const ImageDefault = path.join(__dirname,"../assets/imagen/ImageLogin3.png")
/*---------------------------------------------------------------*/
const {RegistreEmployee,GetEmployeesPaged} = require(path.join(__dirname,'../DB_controls/Employee'))
/*---------------------------------------------------------------*/

let window_register_employee;

module.exports = function Register_employee(parentWindow) {
  window_register_employee = new BrowserWindow({
        width:940,
        height:560,
       // modal: true,
        resizable:false, 
        frame:false,
       // parent: parentWindow, // Si quieres que sea modal, necesita un padre
        show: false, // Mejor oculto hasta que esté listo
        icon: path.join(__dirname, '../favicon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, "../preload.js")
        }
    });

    window_register_employee.loadFile('app/section_main/Register_employee.html');

    // Herramientas de desarrollo
   window_register_employee.webContents.openDevTools();

    // Bloquear nuevas ventanas (Forma moderna)
    window_register_employee.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    window_register_employee.once('ready-to-show', () => {
        window_register_employee.show();
    });

}


ipcMain.on("select-Image-new-employee",(even,data)=>{

   dialog.showOpenDialog(window_register_employee,{
        title: 'Seleccionar archivo',
        buttonLabel: 'Abrir',
        filters: [
          { name: 'Imágenes', extensions: ['jpg', 'png', 'gif','jpeg'] }
        ],
        properties: ['openFile']
      }).then(result => {
        
      if(result.canceled==false){

          window_register_employee.webContents.send("Image-select-new-employee",result.filePaths[0]);
      }
      
      if(result.canceled==true){

         window_register_employee.webContents.send("Image-select-new-employee",ImageDefault);
      }

      }).catch(err => {

        console.log(err);
        
      });
})


ipcMain.on("save-data-registre-employee",async(even,data)=>{

      await RegistreEmployee(data).then((result)=>{
       
       window_register_employee.webContents.send("open-modal-register-employee");
        
      }).catch((error)=>{
        
        console.log("ERROR DATA SAVE REGISTRO")

      })

})
