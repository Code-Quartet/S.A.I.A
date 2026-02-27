

function Dasboard(app){

let template_dasboard = `<div class="dashboard-container">
	<aside class="dashboard-sidebar">
		<nav class="dashboard-menu">
			<a class="menu-item ItemMenuActive"><span class="icon-user"></span> Mi Perfil </a>
			<a class="menu-item"><span class="icon-user-plus"></span> Nueva Inscripción</a> 
			<a class="menu-item"><span class="icon-list"></span> Ver todos los Inscritos</a>
			<a class="menu-item"><span class="icon-search"></span> Buscar por Cédula</a>
			<a class="menu-item"><span class="icon-book"></span> Gestionar Cursos</a>
			<a class="menu-item"><span class="icon-instructor"></span> Gestionar Instructores</a>
			<a class="menu-item"><span class="icon-users"></span> Gestionar Empleados</a>
			<a class="menu-item"><span class="icon-bin"></span> Papelera</a>
		</nav>
		<div class="menu-footer">
			<a class="menu-item logout"><span class="icon-exit"></span> Cerrar Sesión</a>
			<p class="version-text">SAIA v2 - Prototipo</p>
		</div>			
	</aside>
	<section class="container-admin-info" id="container-admin-info">
		</section>
</div>`;


document.getElementById(app).innerHTML=template_dasboard;

EfectoColorMenuItem()

 Select_menu(0,"container-admin-info")
}

function EfectoColorMenuItem(){

	let ItmeMenu = document.querySelectorAll('.menu-item');

	ItmeMenu.forEach(function(element,index) {
	    element.onclick = function() {
	        // 1. Primero quitamos el color azul de TODOS los elementos
	        ItmeMenu.forEach((item) => {
	            item.classList.remove("ItemMenuActive");
	       
	        });

	        Select_menu(index,"container-admin-info")
			
	        // 2. Luego aplicamos el color rojo solo al elemento que se clickeó
	        this.classList.add("ItemMenuActive");
	    }
	});
}


function Select_menu(index,container){

switch (index) {
	case 0:
		My_Profile(container)
		break;
	case 1:
		New_Registration(container)
		break;
	case 2:
		View_all_Registered_Users(container)
	break;	
	default:
		// statements_def
		break;
}

}