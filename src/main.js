
const {app, BrowserWindow, Menu, MenuItem, ipcMain, dialog, Notification } = require('electron');
const path = require('path')
const fs = require('fs')
const os_system = require('os')
const { v4: uuidv4 } = require('uuid');
console.log(path.join(__dirname,"../database/.config.json"))
const config = require(path.join(__dirname,"../database/.config.json"));
/*---------------------------------------------------------*/
/*--------------LINK BASE DE DATOS (Ajustado a carpeta raíz /database) ------------------------*/
// Subimos un nivel (../) para salir de src y entrar a database
const SAIADB = require(path.join(__dirname, './database_controls/SAIA_manager.js'));
const { LimpiarBaseDeDatos } = require(path.join(__dirname, './database_controls/DataTrialSAIA'));
const DB = new SAIADB(path.join(__dirname, '../../database/SAIA.db'));
/*--------------RECURSOS ESTÁTICOS ------------------------*/
const ImageDefault = path.join(__dirname, "../../assets/img/ImageLogin3.png"); // Cambiado imagen -> img según estructura

/*--------------MENSAJES Y SESIÓN (Dentro de src/src_main o similar) ------------------------*/
const Register_App = require(path.join(__dirname, './RegisterApp/RegisterApp'));

/*-----------------------------------*/
const { InfoMessage, ErrorMessage } = require(path.join(__dirname, './section_main/Message_system'));
const { UserSessionHistory, login_system, RegisterSessionEvent, UpdateImagenAvatar, GetAllSessionHistory } = require(path.join(__dirname, './database_controls/User'));
const Login_password_master = require(path.join(__dirname, './section_main/LoginMaster'));

/*------------MÓDULOS EXTERNOS Y DASHBOARD ----------------*/
const { GetDashboardStats, GlobalSearch } = require(path.join(__dirname, './database_controls/Dasboard'));

/*------------CONTROLES DE EDICIÓN ----------------*/

const Edit_password = require(path.join(__dirname, './section_main/Edit_password'));
const Edit_password_master = require(path.join(__dirname, './section_main/Edit_password_master'));
const Edit_email = require(path.join(__dirname, './section_main/Edit_email'));
const Edit_user = require(path.join(__dirname, './section_main/Edit_user'));

/*------------CURSOS ----------------*/

const { GetTopCourses, GetCoursePaged, SearchCourse, DeleteCourse, SearchCourseByStatus } = require(path.join(__dirname, './database_controls/Course'));
const Register_course = require(path.join(__dirname, './section_main/Register_course'));
const Edit_course = require(path.join(__dirname, './section_main/Edit_course'));
const Info_course = require(path.join(__dirname, './section_main/Info_course'));

/*------------ESTUDIANTES ----------------*/

const { GetStudentPaged, SearchStudentPagedName, DeleteStudentLogical } = require(path.join(__dirname, './database_controls/Student'));
const Register_student = require(path.join(__dirname, './section_main/Register_student'));
const Update_student = require(path.join(__dirname, './section_main/Update_student'));
const Info_student = require(path.join(__dirname, './section_main/Info_student'));

/*------------INSTRUCTORES ----------------*/

const { GetInstructorsPaged, InsertInstructor, SearchInstructor, searchInstructorByStatus, DeleteInstructor } = require(path.join(__dirname, './database_controls/Instructor'));
const Register_instructor = require(path.join(__dirname, './section_main/Register_instructor'));
const Edit_instructor = require(path.join(__dirname, './section_main/Edit_instructor'));
const Info_instructor = require(path.join(__dirname, './section_main/Info_instructor'));

/*------------EMPLEADOS ----------------*/

const { searchEmployee, SearchFilterEmployee, RegistreEmployee, GetEmployeesPaged, DeleteEmployeeLogical } = require(path.join(__dirname, './database_controls/Employee'));
const Register_employee = require(path.join(__dirname, './section_main/Register_employee'));
const Edit_employee = require(path.join(__dirname, './section_main/Edit_employee'));
const Info_employee = require(path.join(__dirname, './section_main/Info_employee'));

/*------------PAPELERA Y RESTAURACIÓN ----------------*/

const { GlobalSearchTrash, GetCoursePagedTrash, GetStudentPagedTrash, GetEmployeesPagedTrash, GetInstructorsPagedTrash } = require(path.join(__dirname, './database_controls/Trash'));
const { RestoreCourse, RestoreStudent, RestoreEmployee, RestoreInstructor } = require(path.join(__dirname, './database_controls/Restore'));
const { ClearAllTrash, DeleteInstructorPermanent, DeleteEmployeePermanent, DeleteStudentPermanent, DeleteCoursePermanent } = require(path.join(__dirname, './database_controls/PermanentDelete'));
const AlertDeletedPermanet = require(path.join(__dirname, './section_main/AlertDeletedPermanet'));

/*-------- VENTANA PRINCIPAL ------------*/

/*----Variable del systema ---*/
let User_sesion_login = null;
/*----Variable del systema ---*/
function Select_system_type(){

console.log("Select-System")

if(config.state==false && config.plataform=="" && config.cpu=="" && config.hostname==""){
  console.log("register app")
  Register_App()
}

if(config.state==true && config.plataform!=="" && config.cpu!=="" && config.hostname!==""){
  console.log("Open system")

  createWindow()

}

}
/*--------select-system-init------------*/


function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1028,
        height: 620,
        icon: path.join(__dirname, '../build/favicon.ico'), // Apunta a la carpeta build en la raíz
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js') // preload.js está en la misma carpeta que main.js
        }
    });

    // IMPORTANTE: index.html está en la RAÍZ, no en /app/
    // Como main.js está en /src, subimos un nivel
    mainWindow.loadFile(path.join(__dirname, '../index.html'));

    mainWindow.webContents.openDevTools();
    
    // Bloqueo de nuevas ventanas
    mainWindow.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}


/****************************LOGIN SYSTEM APP******************************************************/

/*LOGIM SYSTEM APP*/
/*LOGIM DEL SYSTEMA APLICACION*/
ipcMain.on('Login-user-master-permission',async(event,data) => {

  //console.log(data)

  Login_password_master(mainWindow,data);


})


ipcMain.on('Login-user-app',async(event,data) => {

  //console.log("login",data)

     await login_system(data).then(async(result)=>{

        if(result!=null){

          User_sesion_login=result;

          mainWindow.send("Data-user-employee",result)
         //console.log("result",result.user.key)
          await RegisterSessionEvent(result.user.key, 'LOGIN');

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

      console.log(error)
      
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

ipcMain.on("Login-out-user-register",async(event,data) => {

    await RegisterSessionEvent(User_sesion_login.user.key, 'LOGOUT');

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
ipcMain.on("Get-data-stats-dasboard",async(event,data)=>{
  let result = await GetDashboardStats()

  //console.log("StatsDasboard",result)
  mainWindow.webContents.send("Data-stats-dasboard",result);

  /*--------------------------------------*/
     let resultcourse = await GetTopCourses()
    // console.log("course",resultcourse) 
     mainWindow.webContents.send("Data-list-course-dasboard",resultcourse);
     /*------------------------------------*/
     let resultHistory = await UserSessionHistory()
     //console.log("HistoryUser",resultHistory)
     mainWindow.webContents.send("List-history-data-user",resultHistory);

})
/***********************DASBOARD*********************************************/
/********************************System Reload Dasboard***********************************************/
ipcMain.on("Reload-dasboard-system-data-MyProfile",(event,data)=>{

  mainWindow.webContents.send("reload-user-data-modif",User_sesion_login);

})

ipcMain.on("Reload-dasboard-system-data-Instructor",async(event,data)=>{

  let result = await GetInstructorsPaged()
  mainWindow.webContents.send("data-list-instructor",result);

})

ipcMain.on("Reload-dasboard-system-data-Course",async(event,data)=>{

     let result = await GetCoursePaged() 
     mainWindow.webContents.send("Data-list-course",result);

})

ipcMain.on("Reload-dasboard-system-data-Student",async(event,data)=>{

    let result = await GetStudentPaged();
  // await console.log("Reload-dasboard-system-data-Student",result)
    await mainWindow.webContents.send("Data-list-Student",result);

})

ipcMain.on("Reload-dasboard-system-data-Employee",async(event,data)=>{

    let result = await GetEmployeesPaged()
    //console.log("Reload-dasboard-system-data-Employee",result)
    mainWindow.webContents.send("Render-data-employee-list",result)

})
/********************************System Reload Dasboard***********************************************/
/***********************MY-PROFILE******************************************/
ipcMain.on('Image-select-my-profile',(event,id) => {

      dialog.showOpenDialog(mainWindow,{
        title: 'Seleccionar archivo',
        buttonLabel: 'Abrir',
        filters: [
          { name: 'Imágenes', extensions: ['jpg', 'png', 'gif','jpeg'] }
        ],
        properties: ['openFile']
      }).then((result) => {

      if(result.canceled==false){

      mainWindow.webContents.send("Imagen-user-select-my-profile",result.filePaths[0]);
      mainWindow.webContents.send("notification-my-profile");
      setTimeout(function(){

    dialog.showMessageBox({
          title: 'Notificación',
          type:'none',
          message: 'Imagen de Usuario Actualizado',
          detail: 'Retorno al Login para establecer información',
          icon: 'info',
          buttons: ['Aceptar'],
          defaultId: 0,
          cancelId: 1,
          noLink: true
    }).then(result => {
   
            mainWindow.webContents.send("reload-user-data-modif");

    }).catch(err => {
    console.log(err);
    });

        
        
      },1500)

        UpdateImagenAvatar(id,result.filePaths[0])

      }
      
      if(result.canceled==true){

         // mainWindow.webContents.send("Imagen-user-select-my-profile",ImageDefault);
      }


      }).catch((err) => {
        
         console.log(err)

      });

})


ipcMain.on('Editar-informacion-contrasena',(event,id) => {

  Edit_password(mainWindow,id)

})

ipcMain.on('Editar-informacion-contrasena-maestra',(event,id) => {

  Edit_password_master(mainWindow,id);

})

ipcMain.on('Editar-informacion-usuario',(event,id) => {


  Edit_user(mainWindow,id)

})

ipcMain.on('Editar-informacion-correo',(event,id) => {

  Edit_email(mainWindow,id)

})


/*-------------------------------------------------*/

ipcMain.on('Exportar-excel-tabla-unica',(event,tabla) => {

  console.log('Iniciando Excel-Exportar');

    // Generamos fecha y hora para el nombre por defecto
    const ahora = new Date();
    const fecha = ahora.toISOString().split('T')[0];
    const hora = String(ahora.getHours()).padStart(2, '0') + '-' + String(ahora.getMinutes()).padStart(2, '0');
    
    const options = {
        title: 'Exportar a Excel',
        buttonLabel: 'Exportar',
        defaultPath: `Reporte_General_${fecha}_${hora}.xlsx`, // Nombre sugerido
        filters: [
            { name: 'Excel Workbook', extensions: ['xlsx'] }
        ]
    };

    // USAMOS showSaveDialog porque estamos creando/exportando un archivo
    dialog.showSaveDialog(mainWindow, options)
        .then(result => {
            // Verificamos que no haya cancelado y que exista una ruta
            if (!result.canceled && result.filePath) {
                console.log("Exportando Excel en:", result.filePath);
                
                // Llamamos a tu función de base de datos pasando la ruta elegida
                DB.exportarTablaAExcel(tabla,result.filePath);
            }
        })
        .catch(err => {
            console.error("Error al exportar Excel:", err);
        });

})


/*-------------------------------------------------*/

ipcMain.on('Excel-Exportar', (event, id) => {
    console.log('Iniciando Excel-Exportar');

    // Generamos fecha y hora para el nombre por defecto
    const ahora = new Date();
    const fecha = ahora.toISOString().split('T')[0];
    const hora = String(ahora.getHours()).padStart(2, '0') + '-' + String(ahora.getMinutes()).padStart(2, '0');
    
    const options = {
        title: 'Exportar a Excel',
        buttonLabel: 'Exportar',
        defaultPath: `Reporte_General_${fecha}_${hora}.xlsx`, // Nombre sugerido
        filters: [
            { name: 'Excel Workbook', extensions: ['xlsx'] }
        ]
    };

    // USAMOS showSaveDialog porque estamos creando/exportando un archivo
    dialog.showSaveDialog(mainWindow, options)
        .then(result => {
            // Verificamos que no haya cancelado y que exista una ruta
            if (!result.canceled && result.filePath) {
                console.log("Exportando Excel en:", result.filePath);
                
                // Llamamos a tu función de base de datos pasando la ruta elegida
                DB.exportarTodoAExcel(result.filePath);
            }
        })
        .catch(err => {
            console.error("Error al exportar Excel:", err);
        });
});

ipcMain.on('Excel-Importar', (event, id) => {
    console.log('Iniciando Excel-Importar');

    const options = {
        title: 'Seleccionar archivo de Excel',
        defaultPath: 'C:/',
        buttonLabel: 'Importar',
        filters: [
            { name: 'Libros de Excel', extensions: ['xlsx', 'xls'] }
        ],
        properties: ['openFile']
    };

    dialog.showOpenDialog(mainWindow, options)
        .then(result => {
            // 1. Validar si el usuario canceló la selección
            if (result.canceled || result.filePaths.length === 0) {
                console.log("Importación cancelada");
                return;
            }

            // 2. CORRECCIÓN: Usar filePaths[0] (es un array)
            const rutaSeleccionada = result.filePaths[0];

            console.log("Archivo seleccionado para importar:", rutaSeleccionada);
            
            // Llamamos a tu función de base de datos
            DB.importarTodoDesdeExcel(rutaSeleccionada);

        })
        .catch(err => {
            console.error("Error al abrir el diálogo de importación:", err);
        });
});

/*-*/
ipcMain.on('Importar-SQLITE-DB', (event, id) => {
    console.log('Iniciando Importar-SQLITE-DB');

    const options = {
        title: 'Seleccionar Base de Datos para Importar',
        buttonLabel: 'Importar', // Cambiado de 'Guardar' a 'Importar' por claridad
        filters: [
            { name: 'SQLite Database', extensions: ['db'] }
        ],
        // 'promptToCreate' no es válido para abrir archivos, solo 'openFile'
        properties: ['openFile'] 
    };

    dialog.showOpenDialog(mainWindow, options)
        .then(result => {
            // CRÍTICO: Verificar si el usuario cerró la ventana sin elegir nada
            if (result.canceled || result.filePaths.length === 0) {
                console.log("Importación cancelada por el usuario");
                return;
            }

            const address = result.filePaths[0];
            console.log("Ruta cargada:", address);

            // Ejecutar la lógica de importación
            DB.importarArchivoDB(address);
            
        })
        .catch(err => {
            console.error("Error al abrir el diálogo de importación:", err);
        });
});

ipcMain.on('Exportar-SQLITE-DB', (event, id) => {
    // 1. Obtener la fecha y hora local
    const ahora = new Date();
    
    // Formatear: YYYY-MM-DD (Ej: 2026-03-19)
    const fecha = ahora.toISOString().split('T')[0];
    
    // Formatear: HH-mm (Ej: 18-30) 
    // Usamos padStart para asegurar que siempre haya 2 dígitos (ej: 09 en vez de 9)
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    
    const nombreSugerido = `respaldo_db_${fecha}_${horas}_${minutos}.db`;

    const options = {
        title: 'Exportar Base de Datos',
        buttonLabel: 'Exportar',
        defaultPath: nombreSugerido, 
        filters: [
            { name: 'SQLite Database', extensions: ['db'] }
        ]
    };

    dialog.showSaveDialog(mainWindow, options)
        .then(result => {
            if (!result.canceled && result.filePath) {
                console.log("Ruta seleccionada:", result.filePath);
                DB.respaldarArchivoDB(result.filePath);
            }
        })
        .catch(err => {
            console.error("Error en el diálogo:", err);
        });
});
/***********************MY-PROFILE******************************************/
/**************************consulta previa *********************************************/
ipcMain.handle('buscar-sugeridos', async (event, data) => {
    try {
        // Llamamos a la función de búsqueda
        let result = await GlobalSearch(data.table,data.terms);

        // Verificamos si la búsqueda fue exitosa y si hay datos
        if (result.success && Array.isArray(result.data)) {
            // Retornamos solo los primeros 8 resultados del array 'data'
            return result.data.slice(0, 8);
        }

        return []; // Retornar vacío si no hubo éxito o no hay datos
    } catch (error) {
        console.error("Error en ipcMain buscar-sugeridos:", error);
        return [];
    }
});
/**************************consulta previa *********************************************/
/*************************NEW INSCRIPTCION**********************************/

ipcMain.on("Get-data-Student-list",async(event,data)=>{

    let result = await GetStudentPaged();
    console.log(result)
    mainWindow.webContents.send("Data-list-Student",result);

})

ipcMain.on("Search-Student-data",async(event,data)=>{

     let result = await SearchStudentPagedName(data);
     mainWindow.webContents.send("Data-list-Student-serach",result);

})

ipcMain.on("Search-Student-filter-data",async(event,data)=>{

  let result = await SearchStudentPagedName(data);
  mainWindow.webContents.send("Data-list-Student-serach",result);

})

ipcMain.on("search-data-pagination-student",async(even,pos)=>{

    let result = await GetStudentPaged(pos)
    mainWindow.webContents.send("Data-list-Student",result)
})

ipcMain.on("Open-registre-new-Student",(event,data)=>{

    Register_student()

})

ipcMain.on("Open-system-edit-student-register",(event,id)=>{
 
  Update_student(mainWindow,id)

})

ipcMain.on("Open-system-info-student-register",(event,id)=>{
 
   Info_student(mainWindow,id)

})

ipcMain.on("Deleted-student-register",(event,id)=>{

  console.log("Deleted-employee-register",id)
 
  DeleteStudentLogical(id).then((result)=>{
     console.log(result)

    dialog.showMessageBox({
                title:"Notificación",
                message:"Estudiante Eliminado",
                icon: 'error',
                 type:'error',
                buttons: ['Aceptar'],
                defaultId: 0,
                cancelId: 1
          }).then(async result => {
              
                console.log(result.response);
                    let resultgetStudent = await GetStudentPaged();
                   await mainWindow.webContents.send("Data-list-Student",resultgetStudent);


          }).catch(err => {
              
              console.log(err);
        });


   }).catch((err)=>{

   })

})

/*************************NEW INSCRIPTCION**********************************/
/*****************************Register New Cource*******************************/


ipcMain.on("Select-course-list",async(event,data)=>{

     let result = await GetCoursePaged() 
     mainWindow.webContents.send("Data-list-course",result);

})

ipcMain.on("search-data-registre-course",async(event,data)=>{
  
   let result = await SearchCourse(data)
   mainWindow.webContents.send("Data-list-course-search",result);

})

ipcMain.on("search-data-registre-course-by-status",async(event,data)=>{

   let result = await SearchCourseByStatus(data)
   mainWindow.webContents.send("Data-list-course-search",result);

})

ipcMain.on("search-paginationCourse",async(event,data)=>{

     let result = await GetCoursePaged(data) 
     mainWindow.webContents.send("Data-list-course-search",result);

})

ipcMain.on("Open-system-new-course-register",(event,data)=>{
 
  Register_course(mainWindow)

})

ipcMain.on("Open-system-edit-course-register",(event,id)=>{
 
   Edit_course(mainWindow,id)

})

ipcMain.on("Open-system-info-course-register",(event,id)=>{
 

   Info_course(mainWindow,id)

})

ipcMain.on("Delete-course-register",(event,id)=>{

   DeleteCourse(id).then((result)=>{

          dialog.showMessageBox({
                      title:"Notificación",
                      message:"Curso Eliminado",
                      icon: 'error',
                       type:'error',
                      buttons: ['Aceptar'],
                      defaultId: 0,
                      cancelId: 1
          }).then(async result => {
                    
                     // console.log(result.response);


   let resultgetCourse = await GetCoursePaged() 
   mainWindow.webContents.send("Data-list-course-search",resultgetCourse);


                }).catch(err => {
                    
                    console.log(err);
              });

             }).catch((err)=>{

             })

})

/*****************************Register New Cource*******************************/
/***************************Registrar nuevo instructor*************************************/

ipcMain.on("Get-data-instrutor-list",async (event,data)=>{

  let result = await GetInstructorsPaged()
 
  mainWindow.webContents.send("data-list-instructor",result);

})

ipcMain.on("search-data-registre-instructor-by-status",async(event,data)=>{

   let result = await searchInstructorByStatus(data)
   mainWindow.webContents.send("data-list-instructor-search",result);


})

ipcMain.on("search-pagination-Instructor",async(event,data)=>{

 let result = await GetInstructorsPaged(data)
 
  mainWindow.webContents.send("data-list-instructor",result);


})

ipcMain.on("search-data-registre-instructor",async(event,data)=>{

   let result = await SearchInstructor(data)
   mainWindow.webContents.send("data-list-instructor-search",result);


})

ipcMain.on("Open-system-new-instructor-register",(event,data)=>{
 
  Register_instructor(mainWindow)

})

ipcMain.on("Open-system-edit-instructor-register",(event,id)=>{
 
   Edit_instructor(mainWindow,id)

})

ipcMain.on("Open-system-info-instructor-register",(event,id)=>{
 
   Info_instructor(mainWindow,id)
   console.log("Open-system-info-instructor-register",id)

})

ipcMain.on("Deleted-instructor-register",async(event,id)=>{

 await DeleteInstructor(id).then((result)=>{

       if(result.success==true){

                    dialog.showMessageBox({
                            title:result.title,
                            message:result.message,
                            icon:result.type,
                            type:result.type,
                            buttons: ['Aceptar'],
                            defaultId: 0,
                            cancelId: 1
                        }).then(async result => {

                            let resultgetInstructor = await GetInstructorsPaged()
                            mainWindow.webContents.send("data-list-instructor",resultgetInstructor);


                        }).catch(err => {
                            
                            console.log(err);
                    });
          }
          if(result.success==false){

                    dialog.showMessageBox({
                            title:result.title,
                            message:result.message,
                            icon:result.type,
                            type:result.type,
                            buttons: ['Aceptar'],
                            defaultId: 0,
                            cancelId: 1
                        }).then(async result => {

                        }).catch(err => {
                            
                            console.log(err);
                    });
          }

   }).catch((err)=>{

   })

})




/***************************Registrar nuevo instructor*************************************/
/***************************Registrar nuevo Empleado*************************************/


ipcMain.on("Get-data-registre-employee",async(even,data)=>{
    
    let result = await GetEmployeesPaged()
    mainWindow.webContents.send("Render-data-employee-list",result)

})

ipcMain.on("search-data-registre-employee",async(even,data)=>{

  let result = await searchEmployee(data)
  console.log("result",result )
  mainWindow.webContents.send("Render-data-employee-list-search",result)

})


ipcMain.on("search-data-registre-employee-filter",async(even,data)=>{

  let result = await SearchFilterEmployee(data)
  //console.log(result)
  mainWindow.webContents.send("Render-data-employee-list-search",result)

})

ipcMain.on("search-pagination-employee",async(even,pos)=>{

  console.log("search page-employee")
    
    let result = await GetEmployeesPaged(pos)

    mainWindow.webContents.send("Render-data-employee-list",result)

})


ipcMain.on("Open-system-new-employee-register",(event,data)=>{
 
  Register_employee(mainWindow)

})


ipcMain.on("Open-system-edit-employee-register",(event,id)=>{
 
   Edit_employee(mainWindow,id)

})

ipcMain.on("Open-system-info-employee-register",(event,id)=>{
 
   Info_employee(mainWindow,id)

})

ipcMain.on("Deleted-employee-register",(event,id)=>{

  console.log("Deleted-employee-register",id)
 
  DeleteEmployeeLogical(id).then((result)=>{

      //console.log("Deleted-employee-register",result)

      if(result.success==true){

                dialog.showMessageBox({
                        title:result.title,
                        message:result.message,
                        icon:result.type,
                        type:result.type,
                        buttons: ['Aceptar'],
                        defaultId: 0,
                        cancelId: 1
                    }).then(async result => {

                          let resultgetEmployee = await GetEmployeesPaged()
                          mainWindow.webContents.send("Render-data-employee-list",resultgetEmployee)

                    }).catch(err => {
                        
                        console.log(err);
                });
      }
      if(result.success==false){

                dialog.showMessageBox({
                        title:result.title,
                        message:result.message,
                        icon:result.type,
                        type:result.type,
                        buttons: ['Aceptar'],
                        defaultId: 0,
                        cancelId: 1
                    }).then(async result => {

                    }).catch(err => {
                        
                        console.log(err);
                });
      }

  }).catch((err)=>{

  })

})

/***************************Registrar nuevo Empleado*************************************/
/*********************************TRASH***************************************************/
ipcMain.on("Get-data-instrutor-list-trash",async (event,data)=>{

  let result = await GetInstructorsPagedTrash()
 
  mainWindow.webContents.send("data-list-instructor-trash",result);

})

ipcMain.on("Get-data-registre-employee-trash",async (event,data)=>{

  let result = await GetEmployeesPagedTrash()
 
  mainWindow.webContents.send("data-list-employee-trash",result);

})


ipcMain.on("Get-data-Student-list-trash",async (event,data)=>{

  let result = await GetStudentPagedTrash()
 
  mainWindow.webContents.send("data-list-Student-trash",result);

})

ipcMain.on("Get-data-Course-list-trash",async (event,data)=>{

  let result = await GetCoursePagedTrash()
 
  mainWindow.webContents.send("data-list-Course-trash",result);

})


ipcMain.on("Get-data-page-list-trash",async (event,data)=>{
  let result="";
   switch (data.action) {
      case "Student":
        result = await GetStudentPagedTrash(data.pos)
        mainWindow.webContents.send("data-list-Student-trash",result);    
      break;  
      case "Instructor":
        result = await GetInstructorsPagedTrash(data.pos)
        mainWindow.webContents.send("data-list-instructor-trash",result);
      break;
      case "Course":
         result = await GetCoursePagedTrash(data.pos)
         mainWindow.webContents.send("data-list-Course-trash",result);
      break;
      case "Employee":
        result = await GetEmployeesPagedTrash(data.pos) 
        mainWindow.webContents.send("data-list-employee-trash",result); 
      break;
     default:
       // statements_def
       break;
   }
})

ipcMain.on("Restore-Student-system",async(event,key)=>{

            RestoreStudent(key).then(async(result)=>{

                Message(result)

                  let resultrestoreStudent = await GetStudentPagedTrash()
 
                  mainWindow.webContents.send("data-list-Student-trash",resultrestoreStudent);



             }).catch((err)=>{


             })
})

ipcMain.on("Restore-Instructor-system",(event,key)=>{
        
          RestoreInstructor(key).then(async(result)=>{

                Message(result)
                  let resultrestoreInstructor = await GetInstructorsPagedTrash()
 
                mainWindow.webContents.send("data-list-instructor-trash",resultrestoreInstructor);



          }).catch((err)=>{


          })

})

ipcMain.on("Restore-Course-system",(event,key)=>{

          RestoreCourse(key).then(async(result)=>{

                 Message(result)

                   let resultrestoreCourse = await GetCoursePagedTrash()
 
                  mainWindow.webContents.send("data-list-Course-trash",resultrestoreCourse);


          }).catch((err)=>{


          })
})

ipcMain.on("Restore-Employee-system",(event,key)=>{

   RestoreEmployee(key).then(async(result)=>{

        Message(result)

          let resultrestoreEmployee = await GetEmployeesPagedTrash()
 
        mainWindow.webContents.send("data-list-employee-trash",resultrestoreEmployee);



   }).catch((err)=>{


   })

})

/*--------------------------------------------------------------------*/
ipcMain.on("Open-alert-message-modal",(event,data)=>{

  AlertDeletedPermanet(mainWindow,data)

})

/*-----------------------------------------------------------------*/
ipcMain.on("Permanently-Delete-Employee-system",(event,key)=>{
  
    DeleteEmployeePermanent(key).then(async (result)=>{

          Message(result)
          let result_employee = await GetEmployeesPagedTrash()
          mainWindow.webContents.send("data-list-employee-trash",result_employee);


     }).catch((err)=>{
      console.log("Proceso deleted",err)


     })

})

ipcMain.on("Permanently-Delete-Student-system",(event,key)=>{
  
     DeleteStudentPermanent(key).then(async(result)=>{

          Message(result)

            let resultStudent = await GetStudentPagedTrash()
 
         mainWindow.webContents.send("data-list-Student-trash",resultStudent);



     }).catch((err)=>{
      console.log("Proceso deleted",err)


     })

})

ipcMain.on("Permanently-Delete-Instructor-system",(event,key)=>{
  
     DeleteInstructorPermanent(key).then(async(result)=>{

          Message(result)

            let resultInstructor = await GetInstructorsPagedTrash()
 
           mainWindow.webContents.send("data-list-instructor-trash",resultInstructor);



     }).catch((err)=>{
      console.log("Proceso deleted",err)


     })

})   

ipcMain.on("Permanently-Delete-Course-system",(event,key)=>{
  
     DeleteCoursePermanent(key).then(async(result)=>{

          Message(result)

            let resultCourse = await GetCoursePagedTrash()
 
          mainWindow.webContents.send("data-list-Course-trash",resultCourse);



     }).catch((err)=>{
      console.log("Proceso deleted",err)


     })

})

/*-------------------------------------------------------------------------*/
ipcMain.handle('buscar-sugeridos-trash', async (event, data) => {

  console.log("buscar-sugeridos-trash",data)
    try {
        // Llamamos a la función de búsqueda
        let result = await GlobalSearchTrash(data.tabla,data.terms);

        // Verificamos si la búsqueda fue exitosa y si hay datos
        if (result.success && Array.isArray(result.data)) {
            // Retornamos solo los primeros 8 resultados del array 'data'
            return result.data.slice(0, 8);
        }

        return []; // Retornar vacío si no hubo éxito o no hay datos
    } catch (error) {
        console.error("Error en ipcMain buscar-sugeridos:", error);
        return [];
    }
});
ipcMain.on("Search-data-trash",async(event,data)=>{

      let result = await GlobalSearchTrash(data.tabla,data.terms).then((result)=>{

        console.log("Search-data-trash",result)

        if(result.success==true){
            
            mainWindow.webContents.send("Search-data-trash-send",result)
        }
        if(result.success==false){
/*
             dialog.showMessageBox({
                      title:"Notificación",
                      message:data.message,
                      icon: 'info',
                       type:'info',
                      buttons: ['Aceptar'],
                      defaultId: 0,
                      cancelId: 1
          }).then(result => {
                    
                      console.log(result.response);

                }).catch(err => {
                    
                    console.log(err);
              });
         */   
            
        }
      

      }).catch((err)=>{


      })

})

//mainWindow.webContents.send("Search-data-trash-send",result)
/*-------------------------------------------------------------------------*/

ipcMain.on("Open-message-alert-clear-trash",async(event,data)=>{

    dialog.showMessageBox({
                        title:"Alerta",
                        message:"Esta por Limpiar la Papelera los datos se perderan",
                        icon: 'warning',
                        type:'warning',
                        buttons: ['Cancelar','Aceptar'],
                        defaultId: 0,
                        cancelId: 1
                    }).then(result => {
                      
                        console.log(result.response);
                        if(result.response==1){
  
                            Login_password_master(mainWindow,data)

                        }
                         if(result.response==0){
                          
                        }

                      


                  }).catch(err => {
                      
                      console.log(err);
                });

})

ipcMain.on("Clear-Trash-all-data-base",async(event,data)=>{

    await ClearAllTrash().then(async(result)=>{

     mainWindow.webContents.send("Reload-trash-interfaz")
       Message(result)


    }).catch((err)=>{


    })

})
/***********************************************************/
function Message(data){
  if(data.success==true){

        dialog.showMessageBox({
                      title:"Notificación",
                      message:data.message,
                      icon: 'info',
                       type:'info',
                      buttons: ['Aceptar'],
                      defaultId: 0,
                      cancelId: 1
          }).then(result => {
                    
                      console.log(result.response);

                }).catch(err => {
                    
                    console.log(err);
              });


  }
  if(data.success==false){

        dialog.showMessageBox({
                      title:"Alerta",
                      message:data.message,
                      icon: 'error',
                       type:'error',
                      buttons: ['Aceptar'],
                      defaultId: 0,
                      cancelId: 1
          }).then(result => {
                    
                      console.log(result.response);

                }).catch(err => {
                    
                    console.log(err);
              });


  }


}

/*********************************TRASH***************************************************/
/***********************DASBOARD*********************************************/
// Evento cuando la app está lista para crear ventanas
//Register_App
//Select_system_type
app.on('ready',Select_system_type, 
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