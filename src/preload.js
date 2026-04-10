const {contextBridge,ipcRenderer} = require("electron");

contextBridge.exposeInMainWorld(
    "api", {
        os:()=>require('os'),
        fs:()=>require('fs'),
        uid:()=>require('uuid').v1(),
        pdf:()=>require('html-pdf'),
      /*  puppeteer:()=>require('puppeteer'),*/
        OpenSelectImage:(channel)=>{
        
             ipcRenderer.send(channel);
            
        },
        OpenWindow:(channel,data)=>{
                
             ipcRenderer.send(channel,data); 
        },

        /*info*/
        send:(channel, data) => {
              
              ipcRenderer.send(channel, data); 
        },
        receive:(channel, data) => {
            
                ipcRenderer.on(channel,data);
        },
        /*comumicacion entre ventanas */
             buscarSugerencias: (termino) => ipcRenderer.invoke('buscar-sugeridos', termino),
             buscarSugerenciasTrash: (termino) => ipcRenderer.invoke('buscar-sugeridos-trash', termino),
        minimizeWindow: () => ipcRenderer.send('minimize-window'),
       maximizeWindow: () => ipcRenderer.send('maximize-window'),
       closeWindow: () => ipcRenderer.send('close-window')
        
    }
);


  

