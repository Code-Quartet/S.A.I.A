let template_New_Registration= `<div class="container-new-registre">
  
    <div class="registration-form">
        <div class="grid-container-new-registre">    
                <div class="columns column1">

                    <div class="form-group">
                         <label class="label-title">¿Es menor de edad?</label>
                            <label class="toggle-switch">
                            <input type="checkbox" id="ageToggle">
                            <div class="slider">
                              <div class="knob"><span id="text-toggle">No</span></div>
                            </div>
                            <span class="label-text option-yes"></span>
                            <span class="label-text option-no"></span>
                          </label>
                    </div>
                    <div class="form-group">
                        <label>Nombre Completo</label>
                        <input type="text" id="nombre" placeholder="Ej: Rosa María Pérez Gonzales">
                    </div>
                    <!--------->
                    <div style="display: flex; ">
                        <div class="form-group">
                            <label>Cédula</label>
                            <input type="text" id="cedula" placeholder="Ej: 21783921" style="width: 69%; ">
                        </div>
                        <div class="form-group">
                             <label>Edad</label>
                            <input type="text" id="edad" placeholder="Ej: 20" style="width:50px">
                        </div>
                    </div>
                    <!--------->
                    <div class="form-group">
                        <label>Fecha de Nacimiento</label>
                        <input type="date" id="fechanacimiento">
                    </div>

                    <div class="form-group">
                            <label>Dirección</label>
                            <input type="text" id="direccion" placeholder="Ej: Calle 24 entre Av. Miranda y Av. Libertador">
                    </div>
   
                    <div class="form-group">
                            <label>Curso</label>
                            <div class="select-wrapper">
                                <select class="select-input-new-registre" id="tipoCurso">
                                    <option value="" disabled selected>Selecciona un Curso</option>
                                    <option value="1">Curso de Programación</option>
                                    <option value="2">Curso de Diseño</option>
                                </select>
                                <span class="icon-chevron-down custom-arrow"></span> </div>
                    </div>
                    <div class="form-group">
                            <label>Horario</label>
                            <div class="select-wrapper">
                                <select class="select-input-new-registre" id="tipoHorario">
                                    <option value="" disabled selected>Selecciona un Curso</option>
                                    <option value="1">Biurno</option>
                                    <option value="2">Despertino</option>
                                    <option value="2">nocturno</option>
                                </select>
                                <span class="icon-chevron-down custom-arrow"></span> </div>
                    </div>
                </div>
                <div class="columns column2">
                    <div class="sub-container-columns">
                        <div class="form-group ContainerUploadImagen">
                            <div class="file-upload-container-new-registre">
                                <label class="image-uploader" for="fileInputregister">
                                    <div class="main-circle">
                                        <img id="imagen-avatar" class="avatar-main-register" src="assets/imagen/ImageLogin3.png" alt="imagen-dasboard">
                                    </div>

                                    <button class="camera-button" id="Btn_select_image_student">
                                        <span class="icon-camera"></span>
                                    </button> 
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="sub-container-columns">
                         <div class="form-group">
                            <label>Teléfono</label>
                            <input type="tel" id="telefono" placeholder="Ej: 04163003485">
                        </div>

                        <div class="form-group">
                            <label>Correo Electrónico</label>
                            <input type="email"  id="correo" placeholder="Ej: nombre@correo.com">
                        </div>
                    </div>
                    <div class="sub-container-columns">
                        <div class="form-group"  id="info-menor1" style="display:none">
                            <label>Nombre completo del Representante</label>
                            <input type="text" id="nombre_representante" placeholder="Ej: Roza Maria Pérez Gozales">
                        </div>

                        <div class="form-group" id="info-menor2" style="display:none">
                            <label>Cédula del Representante</label>
                            <input type="text" id="cedula_representante" placeholder="Ej: 21783921">
                        </div>

                        <div class="form-group" id="info-menor3" style="display:none">
                            <label>Teléfono del Representante</label>
                            <input type="tel" id="telefono_representante" placeholder="Ej: 04163003485">
                        </div>
                    </div>
                    <div class="sub-container-columns">
                        <div class="action-footer">
                            <button type="submit" class="btn-confirm" id="btn-confirm">
                                Confirmar <span class="icon-checkmark"></span>
                            </button>
                        </div>
                    </div>   
                </div>
        </div>
    </div>
</div>
<div class="top-notification" id="topNotif">
        <span class="contain-icono-message"><span class="icon-checkmark icono-message"></span></span><h3>¡Inscripción guardada!</h3>
    </div>`;

function New_Registration(id){

        document.getElementById(id).innerHTML=template_New_Registration;

        /*-----CONTROL DE VENTANA DE Notificacion-------*/

        const overlay = document.getElementById('modal-message-register');
        const btnOpen = document.getElementById('btn-confirm');
        const btnClose = document.getElementById('closeModal');
        
        const notif = document.getElementById('topNotif');

        function mostrarNotificacion() {
            notif.classList.add('show');
            
        setTimeout(() => {
             cerrarNotificacion();
            }, 4000);
        }

        function cerrarNotificacion() {
            notif.classList.remove('show');
        }
        /*--------------------------------------*/


        /*----------control de button toggle-----------------------*/
        const ageToggle = document.getElementById('ageToggle');

        ageToggle.addEventListener('change', function() {
            //console.log(this.checked)
          if(this.checked) {
            //console.log("Es mayor de edad: Sí");
            document.getElementById("info-menor1").style.display = 'block';
            document.getElementById("info-menor2").style.display = 'block';
            document.getElementById("info-menor3").style.display = 'block';
            document.getElementById("text-toggle").innerHTML = 'Sí';
          } else {
           // console.log("Es mayor de edad: No");
            document.getElementById("info-menor1").style.display = 'none';
            document.getElementById("info-menor2").style.display = 'none';
            document.getElementById("info-menor3").style.display = 'none';
            document.getElementById("text-toggle").innerHTML = 'No';
          }
        });
        /*----------control de button toggle-----------------------*/

document.getElementById("Btn_select_image_student").addEventListener("click",(event)=>{

    api.send("select-Image-new-student")

})

api.receive('Image-select-new-student', async (event,imagen) => {

    document.getElementById("imagen-avatar").src=imagen
})


function Capture_datos_studient_representative(){

 let fecha = new Date();
  let formatofecha = fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear();
  /*--------------------------*/
  const ahora = new Date();
  const horaActual = ahora.getHours().toString().padStart(2, '0') + ':' +
                     ahora.getMinutes().toString().padStart(2, '0') + ':' +
                     ahora.getSeconds().toString().padStart(2, '0');
        /*-----------------------------------------*/
    if(document.getElementById("nombre").value!="" && 
        document.getElementById("cedula").value!="" && 
        document.getElementById("edad").value!="" && 
        document.getElementById("fechanacimiento").value!="" && 
        document.getElementById("correo").value && 
        document.getElementById("telefono").value && 
        document.getElementById("direccion").value){

                let objData={
                    nombre:document.getElementById("nombre").value,
                    cedula:document.getElementById("cedula").value,
                    edad:document.getElementById("edad").value,
                    fechanacimiento:document.getElementById("fechanacimiento").value,
                    correo:document.getElementById("correo").value,
                    tlf:document.getElementById("telefono").value,
                    direccion:document.getElementById("direccion").value,
                    image:document.getElementById("imagen-avatar").src,
                    nombreR:document.getElementById("nombre_representante").value,
                    cedulaR:document.getElementById("cedula_representante").value,
                    tlfR:document.getElementById("telefono_representante").value,
                    fecha:formatofecha,
                    hora:horaActual
                }
           

               //api.send("Register-new-data-student-representante",objData)
               console.log("Register-new-data-student-representante",objData)
    }     
    else{

        api.send("message-campos-vacios-register-inscripcion","complete todo los campos")
    }

}


function Capture_datos_studient(){

 let fecha = new Date();
  let formatofecha = fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear();
  /*--------------------------*/
  const ahora = new Date();
  const horaActual = ahora.getHours().toString().padStart(2, '0') + ':' +
                     ahora.getMinutes().toString().padStart(2, '0') + ':' +
                     ahora.getSeconds().toString().padStart(2, '0');
        /*-----------------------------------------*/
    if(document.getElementById("nombre").value!="" && 
        document.getElementById("cedula").value!="" && 
        document.getElementById("edad").value!="" && 
        document.getElementById("fechanacimiento").value!="" && 
        document.getElementById("correo").value && 
        document.getElementById("telefono").value && 
        document.getElementById("direccion").value){

                let objData={
                    nombre:document.getElementById("nombre").value,
                    cedula:document.getElementById("cedula").value,
                    edad:document.getElementById("edad").value,
                    fechanacimiento:document.getElementById("fechanacimiento").value,
                    correo:document.getElementById("correo").value,
                    tlf:document.getElementById("telefono").value,
                    direccion:document.getElementById("direccion").value,
                    image:document.getElementById("imagen-avatar").src,
                    fecha:formatofecha,
                    hora:horaActual
                }
           

               //api.send("Register-new-data-student",objData)
               console.log("Register-new-data-student",objData)
    }     
    else{

        api.send("message-campos-vacios-register-inscripcion","complete todo los campos")
    }

}

btnOpen.addEventListener('click', (event) => {
     
    if(document.getElementById("text-toggle").innerHTML=="Sí"){

            Capture_datos_studient_representative()

    }
    if(document.getElementById("text-toggle").innerHTML=="No"){

        Capture_datos_studient()

    }

});





    }




