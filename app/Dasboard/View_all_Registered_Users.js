let templete_View_all_Registered_Users=`
<div class="container-tabla-wiev-user">
	<div class="header-table-wiev-user">
		<h2>Todos los Inscritos</h2>
	</div>
	<div class="container-info-wiev-user">
		<div class="info-wiev-user">
			<label>Nombre completo</label>
			<label>Cédula</label>
			<label>Teléfono</label>
			<label>Correo Electrónico</label>
			<label>Curso</label>
			<label>Fecha de Inscripción</label>
		</div>
		<div class="data-info-wiev-user">
			<label class="list-info-wiev-user">
				<label>item</label>
				<label>item</label>
				<label>item</label>
				<label>item</label>
				<label>item</label>
				<label>item</label>
			</label>
			<label class="list-info-wiev-user">
				<label>item</label>
				<label>item</label>
				<label>item</label>
				<label>item</label>
				<label>item</label>
				<label>item</label>
			</label>
			<label class="list-info-wiev-user">
				<label>item</label>
				<label>item</label>
				<label>item</label>
				<label>item</label>
				<label>item</label>
				<label>item</label>
			</label>
			<label class="list-info-wiev-user">
				<label>item</label>
				<label>item</label>
				<label>item</label>
				<label>item</label>
				<label>item</label>
				<label>item</label>
			</label> 			
		</div>
	</div>
	<div class="footer-tabla-wiev-user">
		<button type="submit" class="btn-confirm-table-wiev-user">
                Confirmar <span class="icon-checkmark"></span>
            </button>
	</div>
</div>`;


function View_all_Registered_Users(id){

document.getElementById(id).innerHTML=templete_View_all_Registered_Users

}