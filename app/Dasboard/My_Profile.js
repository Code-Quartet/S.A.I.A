
function My_Profile(id){

	document.getElementById(id).innerHTML=`<div class="container-user-info">
            <header class="header-text">
                <h1>Buen día, Yris</h1>
                <p>Centro de Capacitación 3e - Escuela de Manejo</p>
            </header>
            <div class="container-form">
                <div class="container-avatar-main">       
                    <img class="avatar-main" src="assets/imagen/ImageLogin3.png" alt="imagen-dasboard">
                </div>
				<div class="container-data">
					<div class="info-row">
						<div>
							<label class="info-label">Nombre</label>
							<div class="info-value" id="txt-nombre">Yris</div>
						</div>
						<button class="btn-edit" onclick="pedirVerificacion('nombre')">Editar</button>
						</div>
						<div class="info-row">
							<div>
								<label class="info-label">Correo Electrónico</label>
								<div class="info-value" id="txt-correo">yrisadmin@correo.com</div>
							</div>
							<button class="btn-edit" onclick="pedirVerificacion('correo')">Editar</button>
						</div>
						<div class="info-row">
							<div>
								<label class="info-label">Contraseña</label>
								<input type="password" class="view-input" id="pass-usuario" value="contraseñasecreta" readonly>
							</div>
							<div class="row-right">
								<span class="icon-eye" id="toggle-pass" onclick="toggleVisibility('pass-usuario', this)" style="cursor:pointer; color:#1a43a0"></span>
								<button class="btn-edit" onclick="pedirVerificacion('password')">Editar</button>
								</div>
							</div>
							<div class="info-row">
							    <div>
							        <label class="info-label">Clave Maestra</label>
							        <input type="password" class="view-input" id="clave-maestra" value="123456" readonly>
							    </div>
							    <div class="row-right">
							        <span class="icon-eye" id="toggle-clave" onclick="toggleVisibility('clave-maestra', this)" style="cursor:pointer; color:#1a43a0"></span>
							        <button class="btn-edit" onclick="pedirVerificacion('clave_maestra')">Editar</button>
							    </div>
							</div>
						</div>
					</div>
				</div>`;
}
