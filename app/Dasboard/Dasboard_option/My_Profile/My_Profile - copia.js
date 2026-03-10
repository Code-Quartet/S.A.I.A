/*
FUNCIO My_Profile ENCARGADA DE RENDERIZAR LA INTEFAZ DE INFORMACION DEL USUARIO
RECIVE POR ARGUMENTO EL IDE DEL CONTENEDOR DEL DASBOARD
*/

function My_Profile(id){

	document.getElementById(id).innerHTML=`<div class="container-user-info">
            <header class="header-text">
	            <div class="container-textheader">
	                <label>Buen día,<h1 id="NameEmployee">Yris</h1><h3 id="IDEmployee"></h3></label>
	                <p>Centro de Capacitación 3e - Escuela de Manejo</p>
	            </div>
            </header>
            <div class="container-form">
	            <div class="form">
					<div class="profile-container">
					  <label class="image-uploader" for="fileInput">
					    <div class="main-circle">
					      <img id="avatarPreviewMyprofile" class="avatar-main" src="assets/imagen/ImageLogin3.png" alt="imagen-dasboard">
					    </div>
					    <button class="camera-button" id="btnCamaraMyProfile">
					   	   <span class="icon-camera"></span> 
					    </button>
					  </label>
					</div>

					<div class="container-data">
						    <div class="info-row">
								<div>
									<label class="info-label">Usuario</label>
									<div class="info-value" id="txt-user">Yris</div>
								</div>
								<button class="btn-edit" id="EditarUsuario">Editar</button>
							</div>
							<div class="info-row">
								<div>
									<label class="info-label">Correo Electrónico</label>
									<div class="info-value" id="txt-correo">yrisadmin@correo.com</div>
								</div>
								<button class="btn-edit" id="EditarCorreo">Editar</button>
							</div>
							<div class="info-row">
								<div>
									<label class="info-label">Contraseña</label>
									<input type="password" class="view-input" id="pass-usuario" value="contraseñasecreta" readonly>
								</div>
								<div class="row-right">
									<span class="icon-eye" id="toggle-pass" onclick="toggleVisibility('pass-usuario', this)" style="cursor:pointer; color:#1a43a0"></span>
									<button class="btn-edit" id="EditarContraseña">Editar</button>
								</div>
							</div>
							<div class="info-row">
								<div>
									<label class="info-label">Contraseña Maestra</label>
									<input type="password" class="view-input" id="pass-usuario" value="contraseñasecreta" readonly>
								</div>
								<div class="row-right">
									<span class="icon-eye" id="toggle-pass" onclick="toggleVisibility('pass-usuario', this)" style="cursor:pointer; color:#1a43a0"></span>
									<button class="btn-edit" id="EditarContraseñaMaestra">Editar</button>
								</div>
							</div>
							<div class="info-row">
								<div>
									<label class="info-label">Contraseña Maestra</label>
									<input type="password" class="view-input" id="pass-usuario" value="contraseñasecreta" readonly>
								</div>
								<div class="row-right">
									<span class="icon-eye" id="toggle-pass" onclick="toggleVisibility('pass-usuario', this)" style="cursor:pointer; color:#1a43a0"></span>
									<button class="btn-edit" id="EditarContraseñaMaestra">Editar</button>
								</div>
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
    "name": "luis",
    "age": "20",
    "codId": "23568923",
    "direccion": "Xykua",
    "telefono": "5454545",
    "correo": "sdfsfsf",
    "image": "file:///C:/Users/Duno%20Castellano/Desktop/S.A.I.A/app/assets/imagen/business.png",
    "iduser": "7e6010fb-1dd4-4887-bc6d-e1e5b93a5046"
}
*/
document.getElementById("avatarPreviewMyprofile").src = Data_employee.image
document.getElementById("NameEmployee").innerHTML = Data_employee.name
document.getElementById("IDEmployee").innerHTML = Data_employee.codId
document.getElementById("txt-user").innerHTML = Data_user.user
document.getElementById("txt-correo").innerHTML = Data_employee.correo
document.getElementById("pass-usuario").value = Data_user.password
/*
document.getElementById("")
document.getElementById("")
document.getElementById("")
document.getElementById("")-*
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

/*----EDITAR CONTRASEÑA MASTER---*/
document.getElementById("EditarContraseñaMaestra").addEventListener("click",(event)=>{


api.send("Editar-informacion-contrasena-maestra",Data_user.key)

})


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

