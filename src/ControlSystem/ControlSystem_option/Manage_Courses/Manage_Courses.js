let template_register_course =`
<main class="container-manage-table">    
    <header class="header-table">
       
         <h1 class="title-table">Gestionar Cursos</h1>
    </header>

    <section class="toolbar-table-manage">
        <div class="search-box-table-manage">
          <input id="input-search-course" class="search-input-table-manage" type="search" placeholder="Buscar curso...">
            <div id="results-preview" class="preview-list-search"></div>
            <button class="btn-search-tabla-manage" id="btnSearchCurso">
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
                            Pausa
                        </div>
                        <div class="filter-opt">
                            <input type="checkbox" id="chk-despedido" value="Cancelado">
                           Cancelado
                        </div>
                         <div class="filter-opt">
                            <input type="checkbox" id="chk-despedido" value="Completado">
                           Completado
                        </div>
                        <div class="menu-footer">
                            <button class="btn-apply">Aplicar</button>
                            <button class="btn-reset">Limpiar</button>
                        </div>
                    </div>
            </div>

        <button class="btn-new-data btn-pri" onclick="OpenNewCourse()">
            Nuevo Curso <i class="icon-plus"></i>
        </button>
    </section>

    <section class="container-table-manage">
    <table>
        <thead>
            <tr>
               <th>Curso</th><th>Horario</th><th>Instructor</th><th>Capacidad</th><th>Inscritos</th><th>Estado</th><th>Acciones</th>
            </tr>
        </thead>
        <tbody id="listaCursos">
        </tbody>
    </table>
    </section>
    <footer class="footer-table-manage">
          <nav class=sub-container-pagination-table-manage>
            <div class="pagination-table-manage" id="PaginationRender">

            </div>
        </nav>
        <button class="btn-export" id="ExportCourse" onclick="exportarAExcelCourse()">
            Exportar Listado 📄
        </button>
    </footer>
</main>`;
function Manage_course(id){

    document.getElementById(id).innerHTML=template_register_course;
   /*-------------------------------------------------*/
        if(Data_user.permission=="Sub-Administrador"){

                document.getElementById("ExportCourse").style.display = 'none'
        }
   /*-------------------------------------------------*/


/*-------------------------------------------------------------------------------*/
    document.getElementById("btnSearchCurso").addEventListener("click",(e)=>{

        SearchCourse(document.getElementById("input-search-course").value)

    })

    document.getElementById("input-search-course").addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {

            e.preventDefault(); // Evita comportamientos extraños

            SearchCourse(document.getElementById("input-search-course").value);  

        }
    })

    const searchInput = document.getElementById('input-search-course');
    searchInput.focus()
    searchInput.addEventListener('search', function(event) {
          if (this.value === '') {

                api.send("Select-course-list")

          }
    });
/*------------------------------------------------------------------------*/
        const resultsPreview = document.getElementById('results-preview');
        let currentIndex = -1; // Rastrea la selección del teclado
        let ArraydataSearchInput = []; // Guarda los resultados actuales

// Función que se ejecuta al elegir un producto (Click o Enter)
async function ejecutarBusquedaFinal(data) {

    console.log(data)

    const detalle = SearchCourse(data.Name);
    
    searchInput.value = data.Name;
    resultsPreview.style.display = 'none';
    currentIndex = -1;
    
}

searchInput.addEventListener('keydown', (e) => {
    const items = resultsPreview.querySelectorAll('.preview-item-search');
    
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        currentIndex = (currentIndex + 1) % items.length;
        actualizarSeleccion(items);
    } 
    else if (e.key === 'ArrowUp') {
        e.preventDefault();
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        actualizarSeleccion(items);
    } 
    else if (e.key === 'Enter') {
        e.preventDefault();
        if (currentIndex > -1) {
            ejecutarBusquedaFinal(ArraydataSearchInput[currentIndex]);
        }
    } 
    else if (e.key === 'Escape') {
        resultsPreview.style.display = 'none';
    }
});

function actualizarSeleccion(items) {
    items.forEach((item, index) => {
        if (index === currentIndex) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest' }); // Asegura que sea visible
        } else {
            item.classList.remove('selected');
        }
    });
}

searchInput.addEventListener('input', async (e) => {
    const query = e.target.value;
    currentIndex = -1; // Reiniciar índice al escribir

    if (query.length < 2) {
        resultsPreview.style.display = 'none';
        return;
    }

    ArraydataSearchInput = await api.buscarSugerencias({table:"Course",terms:query});

    if (ArraydataSearchInput.length > 0) {
        resultsPreview.innerHTML = '';
        ArraydataSearchInput.forEach((course, index) => {
            const div = document.createElement('div');
            div.className = 'preview-item-search';
            div.innerHTML = `
                <div>Nombre:${course.Name}</div>
                <div style="margin-left:35px">Descripción:${course.Description}</div>
            `;
            
            div.onclick = () => ejecutarBusquedaFinal(course);
            
            // Mouse over opcional para sincronizar teclado con ratón
            div.onmouseenter = () => {
                currentIndex = index;
                actualizarSeleccion(resultsPreview.querySelectorAll('.preview-item-search'));
            };

            resultsPreview.appendChild(div);
        });
        resultsPreview.style.display = 'block';
    } else {
        resultsPreview.style.display = 'none';
    }
});

// Cerrar si se hace clic fuera
document.addEventListener('click', (e) => {
    if (e.target !== searchInput) resultsPreview.style.display = 'none';
});
/*---------------------------------------*/
    /*-------------------------------------------------------------------------------*/
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
            //alert("Por favor, selecciona al menos un estado.");
            return;
        }

        // 3. Llamar a la función de búsqueda
        api.send("search-data-registre-course-by-status",estadosSeleccionados);

     
    });

    document.querySelector(".btn-reset").addEventListener("click",(e)=>{
        const contenedor = document.getElementById('drop-curso');
const checkboxes = contenedor.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(chk => {
            chk.checked = false; // Esto quita la marca de "check"
        });

         api.send("Select-course-list")

    })

    /*-------------------------------------------------------------------------------*/

    api.send("Select-course-list")

}


function SearchCourse(data){

        api.send("search-data-registre-course",data)
}


api.receive("Data-list-course-search",(event,info)=>{
    console.log("Data-list-course-search",info)
    const table = document.getElementById('listaCursos');
    table.innerHTML="";
    if(info.success==true){
        info.data.forEach((course,index)=>{

                 table.innerHTML += `
                    <tr>
                        <td>${course.Name}</td>
                        <td>${course.Start_Time}/${course.End_Time}</td>
                        <td>${course.Instructor_Name}</td>
                             <td>${course.Capacity}</td>
                                <td>${course.Total_Students}</td>
                        <td><span class="${course.Status}">${course.Status}</span></td>
                        <td class="td-action">
                        <button class="btn-edit-data-table icon-info" onclick="InfoCourse('${course.Key}')"></button>
                            <button class="btn-edit-data-table icon-pencil" onclick="EditCourse('${course.Key}')"></button>
                            <button class="btn-delete-data-table icon-bin"  onclick="Delete_course('${course.Key}')"></button>
                        </td>
                    </tr>
                `;

    })
    }
    if(info.success==false){

             table.innerHTML += `<tr>
            <td colspan="3" style="text-align: center; padding: 20px; color: gray;">
            ${info.message}</td></tr>`
    }


})

api.receive("Data-list-course",(event,info)=>{

    console.log(info)
    /*
   {
     Key: 'C-5',
     Name: 'Soldadura',
     Capacity: 20,
     Start_Time: '08:00',
     End_Time: '10:00',
     Status: 'Activo',
     Cost: '50',
     Days: 'Lun,Mar',
     Instructor_ID: 'I-6',
     Instructor_Name: 'Instructor 6',
     Total_Students: 15
   }*/
    const table = document.getElementById('listaCursos');
    table.innerHTML="";

        if(info.success==true){
            info.data.forEach((course,index)=>{

                     table.innerHTML += `
                        <tr>
                            <td>${course.Name}</td>
                            <td>${course.Start_Time}/${course.End_Time}</td>
                            <td>${course.Instructor_Name}</td>
                            <td>${course.Capacity}</td>
                            <td>${course.Total_Students}</td>
                            <td><span class="${course.Status}">${course.Status}</span></td>
                            <td class="td-action">
                                <button class="btn-edit-data-table icon-info" onclick="InfoCourse('${course.Key}')"></button>
                                <button class="btn-edit-data-table icon-pencil" onclick="EditCourse('${course.Key}')"></button>
                                <button class="btn-delete-data-table icon-bin"  onclick="Delete_course('${course.Key}')"></button>
                            </td>
                        </tr>
                    `;

            })
        }

        if(info.success==false){

            table.innerHTML +=`<tr>
                    <td colspan="3" style="text-align: center; padding: 20px; color: gray;">
                    ${info.message}</td></tr>`

        }

        /*-------------------------------------------*/

            if(info.pagination["isPaged"]==false){
                document.getElementById("PaginationRender").style.display="none"
            }


            if(info.pagination["isPaged"]==true){

                    document.getElementById("PaginationRender").style.display="flex"

                    renderPaginationCourse(info.pagination)
             }
             /*-------------------------------*/

})

function renderPaginationCourse(data) {
            
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


function SearchPaginationCourse(index){

   api.send("search-paginationCourse",index)


}

function OpenNewCourse(){

    api.send("Open-system-new-course-register")
    
}

function EditCourse(id){

  api.send("Open-system-edit-course-register",id)

}

function InfoCourse(id){

  api.send("Open-system-info-course-register",id)

}


function Delete_course(id){

                let obj={
                key:Data_user.key,
                permission:Data_user.permission,
                method:{
                    action:"Delete-course-register",
                    key:id
                    
                }
            }
            api.send("Login-user-master-permission",obj)


 
}

function exportarAExcelCourse() {

                let obj={
                key:Data_user.key,
                permission:Data_user.permission,
                method:{
                    action:"ExcelExportarUnicoCourse",
                    key:Data_user.key
                    
                }
            }

       api.send("Login-user-master-permission",obj)

   
}