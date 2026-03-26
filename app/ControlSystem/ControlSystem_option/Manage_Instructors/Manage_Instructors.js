let TemplanteManageInstructor=`
<main class="container-manage-table">
   
    <header class="header-table">
     
        <h1 class="title-table">Gestionar Instructores</h1>
    </header>

    <section class="toolbar-table-manage">
        <div class="search-box-table-manage">
            <input id="input-search-instructor" class="search-input-table-manage" type="search" placeholder="Buscar instructor...">
            <button class="btn-search-tabla-manage" id="SearchInstructor">
                <i class="icon-search"></i>
            </button>
        </div>
            <div class="dropdown-table-manage" id="drop-curso">
                    <button class="btn-dropdown-table-manage">
                             Curso ▾
                    </button>
                    <div class="dropdown-menu-table-manage" id="dropdownEstado">
                        <div class="filter-opt">
                            <input type="checkbox" id="chk-activo" value="Activo">
                            Activo
                        </div>
                        <div class="filter-opt">
                            <input type="checkbox" id="chk-inactivo" value="Pausa">
                            Inactivo
                        </div>
                        <div class="filter-opt">
                            <input type="checkbox" id="chk-despedido" value="Despedido">
                           Despedido
                        </div>
                        <div class="menu-footer">
                            <button class="btn-apply">Aplicar</button>
                            <button class="btn-reset">Limpiar</button>
                        </div>
                    </div>
            </div>
        </div>

        <button class="btn-new-data" onclick="OpenRegisterInstructor()">
            <span class="icon-user-plus"></span> Nuevo Instructor
        </button>

    </section>

    <section class="container-table-manage">
       <table class="data-table" id="tablaInstructores">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Especialidad</th>
                    <th>Teléfono</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="listInstructor">

            </tbody>
        </table>
    </section>
        <footer class="footer-table-manage">
        <nav class=sub-container-pagination-table-manage>
            <div class="pagination-table-manage" id="PaginationRender">

            </div>
        </nav>
        <button class="btn-export" onclick="exportarAExcelInstructor()">
            Exportar Listado 📄
        </button>
    </footer>
</main>`;

function Manage_Instructor(id){

	document.getElementById(id).innerHTML=TemplanteManageInstructor;

    api.send("Get-data-instrutor-list")

    /*----------------------*/
    const dropdown = document.querySelector('.dropdown-table-manage');
    const btn = document.querySelector('.btn-dropdown-table-manage');

    // 1. Usar .toggle() es mucho más eficiente
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
    });

    // 2. Cerrar el menú si el usuario hace clic en cualquier otro lugar de la pantalla
    document.addEventListener('click', () => {
       
        dropdown.classList.remove('active');
    });

    // 3. Evitar que el menú se cierre si hacen clic dentro de las opciones (filtros)
    dropdown.addEventListener('click', (e) => {
     
        e.stopPropagation();
    });
/*---------------------------------------------------------------------------------*/
// Escuchar el click en el botón Aplicar del dropdown
document.querySelector('.btn-apply').addEventListener('click', async () => {
    
    // 1. Obtener todos los checkboxes marcados dentro del dropdown
    const checkboxes = document.querySelectorAll('#dropdownEstado .filter-opt input[type="checkbox"]:checked');
    
    // 2. Mapear los valores de los checkboxes marcados
    const estadosSeleccionados = Array.from(checkboxes).map(cb => cb.value);

    if (estadosSeleccionados.length === 0) {
        alert("Por favor, selecciona al menos un estado.");
        return;
    }

    // 3. Llamar a la función de búsqueda
    api.send("search-data-registre-instructor-by-status",estadosSeleccionados);

 
});

document.querySelector(".btn-reset").addEventListener("click",(e)=>{

    api.send("Get-data-instrutor-list")

})


/*-------------------------------------------------------------------------------*/
    document.getElementById("SearchInstructor").addEventListener("click",(e)=>{

        SearchInstructor(document.getElementById("input-search-instructor").value)

    })

    document.getElementById("input-search-instructor").addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {

            e.preventDefault(); // Evita comportamientos extraños

            SearchInstructor(document.getElementById("input-search-instructor").value);  

        }
    })

    const searchInput = document.getElementById('input-search-instructor');
    searchInput.focus()
    searchInput.addEventListener('search', function(event) {
          if (this.value === '') {

                api.send("Get-data-instrutor-list")

          }
    });

/*-------------------------------------------------------------------------------*/
 
}

function SearchInstructor(data){

        api.send("search-data-registre-instructor",data)
}


api.receive("data-list-instructor",(event,info)=>{

    document.getElementById("listInstructor").innerHTML='';

    if(info.success==true){

        info.data.forEach(function(Instructor,index){

            document.getElementById("listInstructor").innerHTML+=`<tr>
                        <td>${Instructor.Name}</td>
                        <td>${Instructor.Specialty}</td>
                        <td>${Instructor.Tlf}</td>
                        <td ><span class="${Instructor.Status}">${Instructor.Status}</span></td>
                        <td class="td-action">
                            <button onclick="OpenInfoInstructor('${Instructor.Key}')" class="btn-edit-data-table icon-info"></button>
                            <button onclick="OpenEditInstructor('${Instructor.Key}')" class="btn-edit-data-table icon-pencil"></button>
                            <button onclick="DeleteInstructor('${Instructor.Key}')" class="btn-delete-data-table icon-bin" ></button>
                        </td>
                    </tr>`;
           
        });
    }
    if(info.success==false){

         document.getElementById("listInstructor").innerHTML+=`<tr>
            <td colspan="3" style="text-align: center; padding: 20px; color: gray;">
            ${info.message}</td></tr>`

    }

    if(info.pagination["isPaged"]==false){
       
        document.getElementById("PaginationRender").style.display="none"
    
    }

    if(info.pagination["isPaged"]==true){

        document.getElementById("PaginationRender").style.display="flex"

         renderPagination(info.pagination)
                
     }
})

function renderPagination(data) {
            
            const container = document.getElementById('PaginationRender');
            container.innerHTML = ''; // Limpiar antes de re-dibujar

            // 1. Botón "Anterior"
            const prevBtn = document.createElement('button');
            prevBtn.className = 'page-btn';
            prevBtn.innerText = '«';
            prevBtn.disabled = data.currentPage === 1;
            prevBtn.onclick = () => SearchPaginationInstructor(data.currentPage - 1);
            container.appendChild(prevBtn);

            // 2. Botones de Números
            for (let i = 1; i <= data.totalPages; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.innerText = i;
                pageBtn.className ="page-btn";
                
                if (i === data.currentPage) {
                    pageBtn.classList.add('active-page');
                }

                pageBtn.onclick = () => SearchPaginationInstructor(i);
                container.appendChild(pageBtn);
            }

            // 3. Botón "Siguiente"
            const nextBtn = document.createElement('button');
            nextBtn.innerText = '»';
            nextBtn.className = 'page-btn';
            nextBtn.disabled = data.currentPage === data.totalPages;
            nextBtn.onclick = () => SearchPaginationInstructor(data.currentPage + 1);
            container.appendChild(nextBtn);
}

api.receive("data-list-instructor-search",(event,info)=>{

    document.getElementById("listInstructor").innerHTML='';

    if(info.success==true){
        
        info.data.forEach( function(Instructor, index) {

            document.getElementById("listInstructor").innerHTML+=`<tr>
                        <td>${Instructor.Name}</td>
                        <td>${Instructor.Specialty}</td>
                        <td>${Instructor.Tlf}</td>
                        <td><span class="${Instructor.Status}">${Instructor.Status}</span></td>
                        <td class="td-action">
                            <button onclick="OpenInfoInstructor('${Instructor.Key}')" class="btn-edit-data-table icon-info" ></button>
                            <button onclick="OpenEditInstructor('${Instructor.Key}')" class="btn-edit-data-table icon-pencil"></button>
                            <button onclick="DeleteInstructor('${Instructor.Key}')" class="btn-delete-data-table icon-bin" ></button>
                        </td>
                    </tr>`;
           
        });
    }
    if(info.success==false){

         document.getElementById("listInstructor").innerHTML+=`<tr>
            <td colspan="3" style="text-align: center; padding: 20px; color: gray;">
            ${info.message}</td></tr>`

    }

})



function SearchPaginationInstructor(index){

   api.send("search-pagination-Instructor",index)
}


function OpenInfoInstructor(key){

    api.send("Open-system-info-instructor-register",key)

}


function restablecerFiltros(){
    
    menu.querySelectorAll('input').forEach(i => i.checked = false);

}

function OpenRegisterInstructor(){
    
    api.send("Open-system-new-instructor-register")
}

function OpenEditInstructor(key){

    api.send("Open-system-edit-instructor-register",key)
}

function DeleteInstructor(key){


let obj={
    key:Data_user.key,
    permission:Data_user.permission,
    method:{
        action:"Deleted-instructor-register",
        key:key
        
    }
}
api.send("Login-user-master-permission",obj)


}

function exportarAExcelInstructor() {
    api.send('Exportar-excel-tabla-unica',"Instructor")
}
