/*
FUNCIO My_Profile ENCARGADA DE RENDERIZAR LA INTEFAZ DE INFORMACION DEL USUARIO
RECIVE POR ARGUMENTO EL IDE DEL CONTENEDOR DEL DASBOARD
*/

function My_Profile(id){

	document.getElementById(id).innerHTML=`<div class="container-user-info">
            <div class="container-form">
	            <div class="form-my-profile">
					<div class="profile-container">
					  <div class="image-uploader" for="fileInput">
					    <div class="main-circle">
					      <img id="avatarPreviewMyprofile" class="avatar-main" src="file:///C:/Users/Duno%20Castellano/Desktop/S.A.I.A/app/assets/imagen/business.png" alt="imagen-dasboard">
					    </div>
					    <button class="camera-button" id="btnCamaraMyProfile">
					   	   <span class="icon-camera"></span> 
					    </button>
					  </div>
<div class="profile-title">
	<div style="display:flex;width: 67%;align-items: center;flex-direction: column;"> 
		<h1 id="NameEmployee" style="font-size: 50px; ">Luis duno</h1> 
		<p id="IDEmployee">23860851420</p>
	</div>
	<div style="display:flex;flex-direction:row;align-items: center;">
		<h2 id="LabelPermission">Permiso:</h2>				            
		<h3 id="Permission" style="padding: 2px;border-radius: 8px;margin-left: 3px;">Administrador</h3>				            
	</div>
</div>
					</div>
					<div class="container-data-user">

						    <div class="info-row-credecial">
						     <span class="section-label">Credenciales</span>
						    </div>
						     <div class="info-row">
								<div>
									<label class="info-label">Usuario</label>
									<div class="info-value" id="txt-user">Yris</div>
								</div>
								<button class="btn-edit icon-pencil" id="EditarUsuario">Editar</button>
							</div>
							<div class="info-row">
								<div>
									<label class="info-label">Correo Electrónico</label>
									<div class="info-value" id="txt-correo">yrisadmin@correo.com</div>
								</div>
								<button class="btn-edit icon-pencil" id="EditarCorreo">Editar</button>
							</div>
							<div class="footer-info-row">

								<button class="btn-main-action" id="openModalBtn">
							            <span class="icon-cog"></span> Configuración Avanzada
							        </button>
							</div> 
					</div>
				</div>
			</div>
		</div>
		    <div class="modal-overlay" id="modalConfig">
        <div class="modal-content">
            <div class="modal-header">
                <h3><span class="icon-cog"></span> Ajustes Avanzados</h3>
                <button class="close-btn" onclick="closeAdvanced()">×</button>
            </div>

            <div class="advanced-grid">
                <div class="advanced-card" id="EditarContraseñaMaestra">
                    <div class="card-icon" style="background: var(--brand-blue);"><span class="icon-key"></span></div>
                    <div class="card-info">
                        <h4>Clave Maestra</h4>
                        <p>Cambiar acceso de nivel 2.</p>
                    </div>
                </div>

                <div class="advanced-card" onclick="alert('Exportando a Excel...')">
                    <div class="card-icon" style="background: var(--brand-excel);"><span class="icon-file-excel"></span></div>
                    <div class="card-info">
                        <h4>Exportar Todo</h4>
                        <p>Generar reporte en Excel.</p>
                    </div>
                </div>

                <div class="advanced-card" onclick="alert('Iniciando Backup de SAIA.db...')">
                    <div class="card-icon" style="background: var(--brand-success);"><span class="icon-database"></span></div>
                    <div class="card-info">
                        <h4>Backup SQLite</h4>
                        <p>Respaldar base de datos.</p>
                    </div>
                </div>

    <div class="advanced-card" id="EditarContraseña">
                    <div class="card-icon" style="background: var(--brand-blue);"><span class="icon-key"></span></div>
                    <div class="card-info">
                        <h4>Clave </h4>
                        <p>Cambiar acceso de nivel 1.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
/***********************DATOS DE BASE DE DATOS *****************************************/
console.log(Data_user)

/*
console.log(Data_employee)
{
    "key": "4d8b091e-e963-4ce7-92ed-307156d1d7e4",
    "user": "admin",
    "permission": "Administrador"
}
*/
document.getElementById("avatarPreviewMyprofile").src = Data_employee.image
document.getElementById("NameEmployee").innerHTML = Data_employee.name
document.getElementById("IDEmployee").innerHTML = Data_employee.codId
document.getElementById("Permission").innerHTML =  Data_user.permission
document.getElementById("txt-user").innerHTML = Data_user.user
document.getElementById("txt-correo").innerHTML = Data_employee.correo



if(Data_user.permission=="Administrador"){
	
	document.getElementById("Permission").style.color = 'white'
	document.getElementById("Permission").style.background = 'blue'

}
if(Data_user.permission=="Empleado"){
	document.getElementById("Permission").style.color = 'white'
	document.getElementById("Permission").style.background = 'green'
}

//document.getElementById("pass-usuario").value = Data_user.password

/***********************DATOS DE BASE DE DATOS *****************************************/

/********** SISTEMAA DE BOTON DE CAMARA*******************************/
document.getElementById("btnCamaraMyProfile").addEventListener("click",(event)=>{

	api.send("Image-select-my-profile")

})

api.receive('Imagen-user-select-my-profile', async (event,imagen) => {

	document.getElementById("avatarPreviewMyprofile").src=imagen
})

/********** SISTEMAA DE BOTON DE CAMARA*******************************/
/*----EDITAR usuario----*/
document.getElementById("EditarUsuario").addEventListener("click",(event)=>{

	api.send("Editar-informacion-usuario",Data_user.key)
})

/*----EDITAR CORREO----*/
document.getElementById("EditarCorreo").addEventListener("click",(event)=>{

	api.send("Editar-informacion-correo",Data_employee.key)
})


/*----EDITAR CONTRASEÑA----*/
document.getElementById("EditarContraseña").addEventListener("click",(event)=>{


api.send("Editar-informacion-contrasena",Data_user.key)


})

/*----EDITAR CONTRASEÑA MASTER--*/
document.getElementById("EditarContraseñaMaestra").addEventListener("click",(event)=>{


api.send("Editar-informacion-contrasena-maestra",Data_user.key)

})

     // Elementos del DOM
        const modal = document.getElementById('modalConfig');
        const btnOpen = document.getElementById('openModalBtn');

        // Función para mostrar/ocultar contraseña
        function toggleView(id, icon) {
            const input = document.getElementById(id);
            if (input.type === "password") {
                input.type = "text";
                icon.classList.replace("icon-eye", "icon-eye-blocked");
            } else {
                input.type = "password";
                icon.classList.replace("icon-eye-blocked", "icon-eye");
            }
        }

        // Abrir Modal
        btnOpen.addEventListener('click', () => {
            modal.style.display = 'flex';
        });
}

        // Cerrar Modal
        function closeAdvanced() {
        	const modal = document.getElementById('modalConfig');
            modal.style.display = 'none';
        }

function toggleVisibility(idInput, icono) {
    const input = document.getElementById(idInput);
    
    if (input.type === "password") {
        // Mostrar contraseña
        input.type = "text";
        // Cambiar icono (Dependiendo de tu pack de Icomoon, podrías cambiar la clase)
        icono.classList.remove("icon-eye");
        icono.classList.add("icon-eye-blocked"); 
    } else {
        // Ocultar contraseña
        input.type = "password";
        icono.classList.remove("icon-eye-blocked");
        icono.classList.add("icon-eye");
    }
}



