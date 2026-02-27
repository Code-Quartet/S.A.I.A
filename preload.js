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
       
        Info_Windows_Send:(channel,data) => {
               ipcRenderer.send(channel,data); 
        },
        Info_Windows_Receive:(channel,data) => {
               ipcRenderer.on(channel,data);
        },
         minimizeWindow: () => ipcRenderer.send('minimize-window'),
       maximizeWindow: () => ipcRenderer.send('maximize-window'),
       closeWindow: () => ipcRenderer.send('close-window')
        
    }
);


  

