

function Dasboard(app){

let template_dasboard = `<div class="dashboard-container">
	<aside class="dashboard-sidebar">
		<section class="sub-fondo-sidebar">
			<nav class="dashboard-menu">
				<a class="menu-item ItemMenuActive"><span class="icon-user"></span> Mi Perfil </a>
				<a class="menu-item"><span class="icon-list"></span>Estudiantes Inscritos</a>
				<a class="status menu-item"><span class="icon-book"></span> Gestionar Cursos</a>
				<a class="status menu-item"><span class="icon-user-tie"></span> Gestionar Instructores</a>
				<a class="status menu-item"><span class="icon-users"></span> Gestionar Empleados</a>
				<a class="status menu-item"><span class="icon-bin"></span> Papelera</a>
			</nav>
			<div class="menu-footer">
				<a class="menu-item logout"><span class="icon-exit"></span> Cerrar Sesión</a>
				<p class="version-text">SAIA v2 - Prototipo</p>
			</div>
		</section>		
	</aside>
	<section class="container-admin-info" id="container-admin-info">
		</section>
</div>`;


		document.getElementById(app).innerHTML=template_dasboard;
		EfectoColorMenuItem()
		if(Data_user.permission=="Administrador"){


		}
		if(Data_user.permission=="Sub-Administrador"){

				let item = document.querySelectorAll(".status")
					item.forEach((item,index)=>{

						item.style.display = 'none';
					})

		}	

		Select_menu(0,"container-admin-info")
}

function EfectoColorMenuItem(){

	let ItmeMenu = document.querySelectorAll('.menu-item');
	ItmeMenu.forEach(function(element,index) {
	   
	   element.onclick = function() {
	    
	        ItmeMenu.forEach((item) => {

	            item.classList.remove("ItemMenuActive");

	        });

	        Select_menu(index,"container-admin-info")
	        this.classList.add("ItemMenuActive");
	    }
	});
}


function Select_menu(index,container){

		console.log(index)

		switch (index){
			case 0:
				My_Profile(container)
			break;
			case 1:
				View_all_Registered_Users(container)
			break;
			case 2:
				Manage_course(container)
			break
			case 3:
				Manage_Instructor(container)
			break;	
			case 4:
				Manage_Employee(container)
			break;		
			case 5:
				Trash(container)
			break;	
			case 6:
				//StatusRender("login")
				api.send("Login-user-master-permission")
			break;	
			default:
				// statements_def
			break;
		}
}
