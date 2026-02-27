function Login(app){

	let template_login =`<div class="body-login">
	    <div class="sub-body-container-login">
			<div class="main-login">
	        	<img src="assets/imagen/ImageLogin3.png" alt="Imagen login" class="imagen-login">
		       <div class="form-login-system">
		           <label class="container-input username">
		                <span class="label-login">Coreo Electronico</span>
		                <div class="sub-container-login">
		                 <span class="icon-user"></span>   
		               <input type="text" name="usename" class="username" placeholder="Ingrese su correo electronico" id="username-input" require>
		               </div>
		           </label>
		            <label class="container-input password">
		                <span class="label-login">Contraseña</span>
		                    <div class="sub-container-login">
		                        <span  class="icon-lock"></span>   
		                        <input type="password" name="password"  class="password-input" id="password" placeholder="Ingrese su contraseña" require>
		                        <button type="button" id="toggleBtn">
		                             <span id="eyeIcon" class="icon-eye"></span>
		                        </button>
		                    </div>
		            </label>
		           <button class="Btn-Ingresar-login" id="Btn-Ingresar-login">Ingresar <span class="icon-arrow-right2"></span></button>
		       </div>
	       </div>
        </div>
      </div>
       <div id="miModal" class="modal">
     <div class="modal-content">
	    <h2>Procesando...</h2>
	    <p>Por favor, espera un momento.</p>
	    <div class="progress-container">
	      <div id="progressBar" class="progress-bar"></div>
	    </div>
	    <p id="statusText">0%</p>
  	</div>
  	  	</div>
<div id="modalIdentidad" class="modal-overlay">
  <div class="modal-card">
    <h2 class="modal-title">Verificar Identidad</h2>
    
    <div class="input-group">
      <label for="claveMaestra">Clave Maestra</label>
      <div class="input-wrapper">
        <span class="icon-lock"></span> 
        <input type="password" id="claveMaestra" placeholder="Ingrese su clave maestra de administrador">
      </div>
    </div>

    <div id="loadingArea" class="loading-area" style="display: none;">
      <div class="progress-bg">
        <div id="bar" class="progress-fill"></div>
      </div>
      <p id="percentText">0%</p>
    </div>

    <div class="button-group">
      <button onclick="iniciarVerificacion()" class="btn-continuar">Continuar<span style="padding:5px;"></span><span class="icon-checkmark"></span></button>
      <button onclick="cerrarModal()" class="btn-salir">Salir</button>
    </div>
  </div>
</div>`;
	document.getElementById(app).innerHTML=template_login;	

/*---------------funcion buttob eyes---------------------------*/

  const passwordInput = document.getElementById('password');
  const toggleBtn = document.getElementById('toggleBtn');
  const eyeIcon = document.getElementById('eyeIcon');

  toggleBtn.addEventListener('click', () => {
    // 1. Cambiamos el tipo de input
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';

    // 2. Intercambiamos las clases de Icomoon
    if (isPassword) {
      eyeIcon.classList.remove('icon-eye');
      eyeIcon.classList.add('icon-eye-blocked');
    } else {
      eyeIcon.classList.remove('icon-eye-blocked');
      eyeIcon.classList.add('icon-eye');
    }
  });

  /*---------------funcion butto eyes---------------------------*/
/*-----------------Validar campos de formulario---------------------------------*/
 const form = document.querySelector('.form-login-system');

  document.getElementById("Btn-Ingresar-login").addEventListener("click",()=>{
      // 1. Prevenimos la recarga de la página
      event.preventDefault();

      // 2. Capturamos los inputs
      const usernameInput = document.getElementById('username-input');
      const passwordInput = document.getElementById('password');

      // 3. Validamos si están vacíos (usando .trim() para evitar espacios en blanco)
      if (usernameInput.value.trim() === "" || passwordInput.value.trim() === "") {
          alert("Por favor, complete todos los campos.");
          return; // Detenemos la ejecución si hay campos vacíos
      }

      // 4. Si pasa la validación, aquí puedes proceder con el envío (fetch, axios, etc.)
      console.log("Formulario válido. Enviando datos...");
      console.log("Usuario:", usernameInput.value);
      console.log("Password:", passwordInput.value);
   abrirModal_barraCarga()

});
/*-----------------Validar campos de formulario---------------------------------*/

}
/*-----------BARRA DE CARGA----------------------------*/
function abrirModal_barraCarga() {
  // 1. Mostrar el modal
  const modal = document.getElementById("miModal");
  const bar = document.getElementById("progressBar");
  const status = document.getElementById("statusText");
  
  modal.style.display = "block";
  let width = 0;

  // 2. Iniciar la animación de la barra
  const intervalo = setInterval(() => {
    if (width >= 100) {
      clearInterval(intervalo);
      // 3. Ejecutar la función al terminar
      finalizarProceso();
    } else {
      width++;
      bar.style.width = width + '%';
      status.innerText = width + '%';
    }
  }, 30); // Velocidad: 30ms por cada 1% (aprox 3 segundos total)
}

function finalizarProceso() {
  alert("¡Carga completada! Ejecutando función final...");
  //mostrarModalVerificacion()
  document.getElementById("miModal").style.display = "none";
  StatusRender("dasboard")

}
/*-----------BARRA DE CARGA----------------------------*/

function mostrarModalVerificacion() {
 
  document.getElementById("modalIdentidad").style.display = "block";
}

function cerrarModal() {
 
  document.getElementById("modalIdentidad").style.display = "none";
  resetearModal();
}

function iniciarVerificacion() {
  const clave = document.getElementById("claveMaestra").value;
  
  if(!clave) {
    alert("Por favor, ingresa la clave maestra");
    return;
  }

  // Ocultar botones y mostrar carga
  document.querySelector(".button-group").style.display = "none";
  document.getElementById("loadingArea").style.display = "block";

  let width = 0;
  const bar = document.getElementById("bar");
  const text = document.getElementById("percentText");

  const intervalo = setInterval(() => {
    if (width >= 100) {
      clearInterval(intervalo);
      ejecutarFuncionFinal();
    } else {
      width += 2; // Sube de 2 en 2 para que sea más rápido
      bar.style.width = width + "%";
      text.innerText = width + "%";
    }
  }, 40);
}

function ejecutarFuncionFinal() {
  alert("Identidad Verificada con éxito.");
  cerrarModal();
}

function resetearModal() {
  // Limpiar para la próxima vez que se abra
  document.getElementById("claveMaestra").value = "";
  document.getElementById("bar").style.width = "0%";
  document.getElementById("percentText").innerText = "0%";
  document.getElementById("loadingArea").style.display = "none";
  document.querySelector(".button-group").style.display = "flex";
}