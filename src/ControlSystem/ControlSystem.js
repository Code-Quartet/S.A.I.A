

function Dasboard(app){

let template_dasboard = `<div class="ControlSystem-container">
	<aside class="ControlSystem-sidebar">
		<section class="sub-fondo-sidebar">
			<nav class="ControlSystem-menu">
				<a class="status menu-item ItemMenuActive"><span class="icon-icoDasboard"></span>Panel Principal</a>
				<a class="menu-item"><span class="icon-user"></span> Mi Perfil </a>
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

				Select_menu(0,"container-admin-info")


		}
		if(Data_user.permission=="Sub-Administrador"){

				Select_menu(1,"container-admin-info")

				let item = document.querySelectorAll(".status")
					item.forEach((item,index)=>{

						item.style.display = 'none';
					})

					document.getElementsByClassName("menu-item")[1].classList.add("ItemMenuActive")


		}	

	
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
				Manage_dasboard(container)
			break;
			case 1:
				My_Profile(container)
			break;
			case 2:
				View_all_Registered_Users(container)
			break;
			case 3:
				Manage_course(container)
			break
			case 4:
				Manage_Instructor(container)
			break;	
			case 5:
				Manage_Employee(container)
			break;		
			case 6:
				Trash(container)
			break;	
			case 7:
				
				api.send("Login-out-user-register")
			break;	
			default:
				// statements_def
			break;
		}
}

api.receive("Login-out-app",(event,data)=>{
StatusRender("login")
})
api.receive("Reload-trash-interfaz",(event,data)=>{

	Select_menu(0,"container-admin-info")

})

api.receive("reload-user-data-modif",(evebt,data)=>{

	//StatusRender("login")
	Data_user={
      key:data.user.key,
      user:data.user.username,
      password:data.user.password,
      permission:data.user.permission
    };
     Data_employee={
        key:data.employee.key,
         name:data.employee.name,
         age:data.employee.age,
         codId:data.employee.cod_id,
         direccion:data.employee.address,
         telefono:data.employee.tlf,
         correo:data.employee.email,
         image:data.employee.image,
     };
	Select_menu(1,"container-admin-info")



})

