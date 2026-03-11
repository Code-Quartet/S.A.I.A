
const {app, BrowserWindow, Menu, MenuItem, ipcMain, dialog, Notification } = require('electron');
const path = require('path')
const fs = require('fs')
const os_system = require('os')
const { v4: uuidv4 } = require('uuid');
const config = require(path.join(__dirname,".config.json"));

/*----------------*/
const SAIADB = require(path.join(__dirname,'./DataBase/SAIA_manager.js'))
const DB = new SAIADB(path.join(__dirname,'./DataBase/SAIA.db'));
/*--------------LINK BASE DE DATOS ------------------------*/
const {InfoMessage,ErrorMessage} = require(path.join(__dirname,'./section_main/Message_system'));

/*---------------------------------------------------------------*/
const {login_system} = require(path.join(__dirname,'./DB_controls/User'))
/*---------------------------------------------------------------*/
/*------------Modulos externos----------------*/
const Register_App = require(path.join(__dirname,'./RegisterApp/RegisterApp'));
const Edit_password = require(path.join(__dirname,'./section_main/Edit_password'));
const Edit_password_master = require(path.join(__dirname,'./section_main/Edit_password_master'));
const Edit_email = require(path.join(__dirname,'./section_main/Edit_email'));
const Edit_user = require(path.join(__dirname,'./section_main/Edit_user'));
const Register_course = require(path.join(__dirname,'./section_main/Register_course'));
const Edit_course = require(path.join(__dirname,'./section_main/Edit_course'));
/*-----------------*/
const Register_instructor = require(path.join(__dirname,'./section_main/Register_instructor'));
const Edit_instructor = require(path.join(__dirname,'./section_main/Edit_instructor'));
/*-----------------*/
const Register_employee = require(path.join(__dirname,'./section_main/Register_employee'));
const Edit_employee = require(path.join(__dirname,'./section_main/Edit_employee'));

/*------------Modulos externos----------------*/

/*--------select-system-init------------*/
function Select_system_type(){

//
if(config.state==false && config.plataform=="" && config.cpu=="" && config.hostname==""){
  console.log("register app")
  Register_App()
  //createWindow()
}

if(config.state==true && config.plataform!=="" && config.cpu!=="" && config.hostname!==""){
  console.log("Open system")

  createWindow()
}

}
/*--------select-system-init------------*/

let mainWindow;

function createWindow() {

      mainWindow = new BrowserWindow({
          width: 1028,
          height: 620,
          icon:path.join(__dirname,'/favicon.ico'),
            webPreferences:{
              nodeIntegration: false, // Deshabilita la integración de Node.js para contenido remoto
              contextIsolation: true, // Aísla el contenido del proceso principal
              preload:path.join(__dirname,'/preload.js') // Archivo de "preload" que carga antes del contenido remoto
            }
      })


      // Cargar el archivo HTML principal
      mainWindow.loadFile('app/index.html');
      
      mainWindow.webContents.openDevTools()
      mainWindow.webContents.on('new-window', (event, url) => {

        event.preventDefault(); // Evita que se abran nuevas ventanas

      });

    // Evento cuando se cierra la ventana
    mainWindow.on('closed', () => {
          mainWindow = null;
    });

}


/****************************LOGIN SYSTEM APP******************************************************/
/*LOGIM SYSTEM APP*/
/*LOGIM DEL SYSTEMA APLICACION*/
ipcMain.on('Login-user-app',async(event,data) => {

  console.log(data)

     await login_system(data).then((result)=>{

        if(result!=null){

          mainWindow.send("Data-user-employee",result)
          //console.log("result",result)

        }else{

           dialog.showMessageBox({
                title: 'Notificación',
                type:'question',
                message:"Credenciales incorrectas o usuario eliminado.",
                icon: 'info',
                buttons: ['Aceptar'],
                defaultId: 0,
                cancelId: 1,
                noLink: true
            }).then(result => {
              console.log(result.response);
            }).catch(err => {
              console.log(err);
            });



        }

     })
     .catch((error) => {
      
         dialog.showMessageBox({
                title: 'Notificación',
                type:'question',
                message:"Error al insertar datos",
                icon: 'info',
                buttons: ['Aceptar'],
                defaultId: 0,
                cancelId: 1,
                noLink: true
            }).then(result => {
              console.log(result.response);
            }).catch(err => {
              console.log(err);
            });

          })

})

ipcMain.on('message-campos-vacios-login', async (event,text) => {

    dialog.showMessageBox({
      title: 'Notificación',
      type:'question',
      message: text,
      icon: 'info',
      buttons: ['Aceptar'],
      defaultId: 0,
      cancelId: 1,
      noLink: true
    }).then(result => {
      console.log(result.response);
    }).catch(err => {
      console.log(err);
    });
  

})
/**********************************LOGIN SYSTEM APP********************************/
/***********************DASBOARD*********************************************/
/***********************MY-PROFILE******************************************/
ipcMain.on('Image-select-my-profile',(event,text) => {

      dialog.showOpenDialog(mainWindow,{
        title: 'Seleccionar archivo',
        buttonLabel: 'Abrir',
        filters: [
          { name: 'Imágenes', extensions: ['jpg', 'png', 'gif','jpeg'] }
        ],
        properties: ['openFile']
      }).then(result => {
        
        //console.log(result.filePaths[0]);
        mainWindow.webContents.send("Imagen-user-select-my-profile",result.filePaths[0]);

      }).catch(err => {
        console.log(err);
      });

})


ipcMain.on('Editar-informacion-contrasena',(event,id) => {

  Edit_password(mainWindow,id);

})

ipcMain.on('Editar-informacion-contrasena-maestra',(event,id) => {

  Edit_password_master(mainWindow,id);

})

ipcMain.on('Editar-informacion-usuario',(event,id) => {


  Edit_user(mainWindow,id)


})
ipcMain.on('Editar-informacion-correo',(event,id) => {

  Edit_email(mainWindow,id);

})
/***********************MY-PROFILE******************************************/
/*************************NEW INSCRIPTCION**********************************/
ipcMain.on("select-Image-new-student",(even,data)=>{

   dialog.showOpenDialog(mainWindow,{
        title: 'Seleccionar archivo',
        buttonLabel: 'Abrir',
        filters: [
          { name: 'Imágenes', extensions: ['jpg', 'png', 'gif','jpeg'] }
        ],
        properties: ['openFile']
      }).then(result => {
        
        //console.log(result.filePaths[0]);
        mainWindow.webContents.send("Image-select-new-student",result.filePaths[0]);

      }).catch(err => {
        console.log(err);
      });


})

ipcMain.on("Register-new-data-student-representante",(even,data)=>{


console.log("Register-new-data-student-representante",data)


})

ipcMain.on("Register-new-data-student",(even,data)=>{


console.log("Register-new-data-student",data)


})
ipcMain.on("message-campos-vacios-register-inscripcion",(even,text)=>{


InfoMessage("Notificación",text)

})
/*************************NEW INSCRIPTCION**********************************/
/*****************************Register New Cource*******************************/
ipcMain.on("Open-system-new-course-register",(event,data)=>{
 
  Register_course(mainWindow)

})
ipcMain.on("Open-system-edit-course-register",(event,data)=>{
 
   Edit_course(mainWindow)

})

ipcMain.on("delete-course-register",(event,data)=>{
 
   //Edit_course(mainWindow)

})
ipcMain.on("search-course-register",(event,data)=>{
 
   //Edit_course(mainWindow)

})
/*****************************Register New Cource*******************************/
/***************************Registrar nuevo instructor*************************************/
ipcMain.on("Open-system-new-instructor-register",(event,data)=>{
 
  Register_instructor(mainWindow)

})
ipcMain.on("Open-system-edit-instructor-register",(event,id)=>{
 
  console.log(id)
   Edit_instructor(mainWindow)

})

/***************************Registrar nuevo instructor*************************************/
/***************************Registrar nuevo Empleado*************************************/
ipcMain.on("Open-system-new-employee-register",(event,data)=>{
 
  Register_employee(mainWindow)

})
ipcMain.on("Open-system-edit-employee-register",(event,id)=>{
 
  console.log(id)
   Edit_employee(mainWindow)

})

/***************************Registrar nuevo Empleado*************************************/
/***********************DASBOARD*********************************************/
// Evento cuando la app está lista para crear ventanas
app.on('ready', Select_system_type, 
  Menu.setApplicationMenu(null)
  );

// Evento cuando todas las ventanas están cerradas
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Evento cuando la app se activa (solo en macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

/*




// Uso: Cerrar tras 5 segundos
mostrarMensajeTemporal('Este mensaje se cerrará solo...', 5000);
*/