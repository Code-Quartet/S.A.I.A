
const { dialog } = require('electron');

function InfoMessage(title,text){


         dialog.showMessageBox({
          title: title,
          message: text,
          type:'info',
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


function ErrorMessage(title,text){

        dialog.showMessageBox({
                title:title,
                message: text,
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

async function MessageTime(texto, milisegundos) {
  const controller = new AbortController();
  const { signal } = controller;

  // Configuramos el temporizador para abortar la ventana
  const timeout = setTimeout(() => {
    controller.abort();
    console.log('El diálogo se cerró por tiempo límite');
  }, milisegundos);

  try {
    const result = await dialog.showMessageBox({
      title: 'Notificación',
      type: 'none',
      message: texto,
      icon: 'info', // Nota: El icono suele ser una ruta a imagen, 'info' es un tipo.
      buttons: ['Aceptar'],
      defaultId: 0,
      noLink: true,
      signal: signal // Pasamos la señal de aborto aquí
    });

    clearTimeout(timeout); // Si el usuario hace clic, cancelamos el timer
    console.log('Respuesta del usuario:', result.response);
    
  } catch (err) {
    if (err.name === 'AbortError') {
      // Manejo del cierre automático
    } else {
      console.error(err);
    }
  }
}


module.exports={
        InfoMessage:InfoMessage,
        ErrorMessage:ErrorMessage,
        MessageTime:MessageTime
}