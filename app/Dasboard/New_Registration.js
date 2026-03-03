let template_New_Registration= `<div class="container-new-registre">
    <h1 class="main-title-new-registre">Nueva Inscripción</h1>
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
                        <input type="text" placeholder="Ej: Rosa María Pérez Gonzales">
                    </div>

                    <div class="form-group">
                        <label>Cédula</label>
                        <input type="text" placeholder="Ej: 21783921">
                    </div>

                    <div class="form-group">
                        <label>Edad</label>
                        <input type="text" placeholder="Ej: 20" style="width:50px">
                    </div>

                    <div class="form-group">
                        <label>Fecha de Nacimiento</label>
                        <input type="date" >
                    </div>

                    <div class="form-group">
                        <label>Teléfono</label>
                        <input type="tel" placeholder="Ej: 04163003485">
                    </div>

                    <div class="form-group">
                        <label>Correo Electrónico</label>
                        <input type="email" placeholder="Ej: nombre@correo.com">
                    </div>
                </div>
                <div class="columns column2">
                    <div>
                        <div class="form-group ContainerUploadImagen">
                            <label>Foto</label>
                            <div class="file-upload-container-new-registre">
                               <label class="image-uploader" for="fileInputregister">
                                <div class="main-circle">
                                  <img id="avatarPreview-register" class="avatar-main-register" src="assets/imagen/ImageLogin3.png" alt="imagen-dasboard">
                                  <input type="file" id="fileInputregister" accept="image/*" style="display: none;">
                                </div>
                                <div class="camera-button">

                                   <span class="icon-camera"></span> 
                                </div>
                              </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Dirección</label>
                            <input type="text" placeholder="Ej: Calle 24 entre Av. Miranda y Av. Libertador">
                        </div>

                        <div class="form-group">
                            <label>Curso</label>
                            <div class="select-wrapper">
                                <select class="select-input-new-registre">
                                    <option value="" disabled selected>Selecciona un Curso</option>
                                    <option value="1">Curso de Programación</option>
                                    <option value="2">Curso de Diseño</option>
                                </select>
                                <span class="icon-chevron-down custom-arrow"></span> </div>
                        </div>
</div>
     <div>
                        <div class="form-group"  id="info-menor2" style="display:none">
                            <label>Nombre completo del Representante</label>
                            <input type="text" placeholder="Ej: Roza Maria Pérez Gozales">
                        </div>

                        <div class="form-group" id="info-menor1" style="display:none">
                            <label>Teléfono del Representante</label>
                            <input type="tel" placeholder="Ej: 04163003485">
                        </div>
                    </div>
                    <div>
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

document.getElementById(id).innerHTML=template_New_Registration

const ageToggle = document.getElementById('ageToggle');

ageToggle.addEventListener('change', function() {
    //console.log(this.checked)
  if(this.checked) {
    //console.log("Es mayor de edad: Sí");
    document.getElementById("info-menor1").style.display = 'block';
    document.getElementById("info-menor2").style.display = 'block';
    document.getElementById("text-toggle").innerHTML = 'Sí';
  } else {
   // console.log("Es mayor de edad: No");
    document.getElementById("info-menor1").style.display = 'none';
    document.getElementById("info-menor2").style.display = 'none';
    document.getElementById("text-toggle").innerHTML = 'No';
  }
});



const overlay = document.getElementById('modal-message-register');
        const btnOpen = document.getElementById('btn-confirm');
        const btnClose = document.getElementById('closeModal');
        btnOpen.addEventListener('click', (event) => {
            mostrarNotificacion()
        });


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


const fileInputregister = document.getElementById('fileInputregister');
const avatarPreviewregister = document.getElementById('avatarPreview-register');

fileInputregister.addEventListener('change', function() {
  const file = this.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function(e) {
      // Cambiamos el src de la etiqueta img directamente
      avatarPreviewregister.src = e.target.result;
    }

    reader.readAsDataURL(file);
  }
});





    }




