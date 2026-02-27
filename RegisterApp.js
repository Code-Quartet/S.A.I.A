
const {app, BrowserWindow, Menu, MenuItem, ipcMain, dialog, Notification } = require('electron');
const path = require('path')
const fs = require('fs')
const os_system = require('os')

let window_register_app;

module.exports = function Register_App(parentWindow) {
  window_register_app = new BrowserWindow({
        width: 1028,
        height: 620,
        minWidth: 1028,
        minHeight: 620,
        modal: true,
        parent: parentWindow, // Si quieres que sea modal, necesita un padre
        show: false, // Mejor oculto hasta que esté listo
        icon: path.join(__dirname, '../favicon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, "./preload.js")
        }
    });
//console.log(window_register_app)

    window_register_app.loadFile('app/RegisterApp.html');

    // Herramientas de desarrollo
    window_register_app.webContents.openDevTools();

    // Bloquear nuevas ventanas (Forma moderna)
    window_register_app.webContents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });

    window_register_app.once('ready-to-show', () => {
        window_register_app.show();
    });

    // Limpiar datos al iniciar
    Reset_data();
};
/********************************************************************************************/
function Reset_data(){

        console.log("reset")

        const info = {
                    "state":false,
                    "hostname":"",
                    "plataform":"",
                    "cpu":""                 
                }
        let data = JSON.stringify(info);
        fs.writeFile(".config.json",data, function (err) {
                if (err) throw err;
                  console.log('Saved!');
        });

}


ipcMain.on('Instalar-app',(event,arg) => {  

       let hostname = os_system.hostname().toString();
        let platform = os_system.platform().toString();
        let cpu = os_system.cpus()[0].model.toString();

    const info = {
                    "state":true,
                    "hostname":hostname,
                    "plataform":platform,
                    "cpu":cpu                 
                }

        let data = JSON.stringify(info);
        fs.writeFile(".config.json",data, function (err) {
                if (err) throw err;
                  console.log('Saved data install!');
                  app.relaunch();
             app.quit();
        });

});


/*   

*/
/********************************************************************************************/
