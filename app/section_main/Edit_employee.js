
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
const {GetEmployeeWithUser,UpdateEmployee,GetEmployeesPaged} = require(path.join(__dirname,'../DB_controls/Employee'))
/*---------------------------------------------------------------*/

let window_edit_employee;

let Key_employee=null;
module.exports = function Edit_employee(parentWindow,id) {
  window_edit_employee = new BrowserWindow({
      width:940,
        height:540,
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

  Key_employee=id

    window_edit_employee.loadFile('app/section_main/Edit_employee.html');

    // Herramientas de desarrollo
    //window_edit_employee.webContents.openDevTools();

    // Bloquear nuevas ventanas (Forma moderna)
    window_edit_employee.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    window_edit_employee.once('ready-to-show', () => {
        window_edit_employee.show();
    });

}

ipcMain.on("get-data-employee-user",async (event,key)=>{

 let result = await GetEmployeeWithUser(Key_employee)
 window_edit_employee.webContents.send("data-employee-for-edit",result)

})

ipcMain.on("select-Image-edit-employee",(even,data)=>{

   dialog.showOpenDialog(window_edit_employee,{
        title: 'Seleccionar archivo',
        buttonLabel: 'Abrir',
        filters: [
          { name: 'Imágenes', extensions: ['jpg', 'png', 'gif','jpeg'] }
        ],
        properties: ['openFile']
      }).then(result => {
        
      if(result.canceled==false){

          window_edit_employee.webContents.send("Image-select-edit-employee",result.filePaths[0]);
      }
      
      if(result.canceled==true){

         window_edit_employee.webContents.send("Image-select-edit-employee",ImageDefault);
      }

      }).catch(err => {

        console.log(err);
        
      });
})

ipcMain.on("save-data-update-employee",async(even,data)=>{

      await UpdateEmployee(data.key,data).then((result)=>{

        window_edit_employee.webContents.send("open-modal-update-employee");
        
      }).catch((error)=>{
                console.log("ERROR DATA SAVE REGISTRO",error)

        })
})






