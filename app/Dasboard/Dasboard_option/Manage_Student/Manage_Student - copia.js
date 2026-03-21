let templete_View_all_Registered_Users=`<main class="container-manage-table">
        <header class="header-table">
            <h1 class="title-table">Todos los Inscritos</h1>
        </header>

        <section class="toolbar-table-manage">
            <div class="search-box-table-manage">
                <input type="search" class="search-input-table-manage" id="inputSearchStudent" placeholder="Buscar employee...">
                <button class="btn-search-tabla-manage" id="SearchStudent">
                <span class="icon-search"></span>
                </button>
            </div>
   

            <div class="dropdown-table-manage" id="drop-curso">
                <button class="btn-dropdown-table-manage">Curso ▾</button>
                <div class="dropdown-menu-table-manage">
                    <div class="filter-opt"><input type="checkbox"> Inglés</div>
                    <div class="filter-opt"><input type="checkbox"> Manejo</div>
                    <div class="filter-opt"><input type="checkbox"> Dibujo</div>
                    <div class="menu-footer">
                        <button class="btn-apply">Aplicar</button>
                        <button class="btn-reset">Limpiar</button>
                    </div>
                </div>
            </div>

            <div class="dropdown-table-manage" id="drop-fecha">
                <button class="btn-dropdown-table-manage">Fecha ▾</button>
                <div class="dropdown-menu-table-manage active">
                    <label class="filter-opt"><input type="checkbox"> Hoy</label>
                    <label class="filter-opt"><input type="checkbox"> Esta semana</label>
                    <div class="menu-footer">
                        <button class="btn-apply">Aplicar</button>
                        <button class="btn-reset">Limpiar</button>
                    </div>
                </div>
            </div>

            <button class="btn-new-data" onclick="New_Registration()">
                Agregar Estudiante<i class="icon-user-plus" style="margin-left:2px;"></i>
            </button>
        </section>

        <section class="container-table-manage">
            <table>
                <thead>
                    <tr>
                        <th>Nombre Completo</th>
                        <th>Cédula</th>
                        <th>Teléfono</th>
                        <th>Correo Electrónico</th>
                        <th>Curso</th>
                        <th>Fecha de Inscripción</th>
                         <th>Acciones</th>
                    </tr>
                </thead>
                <tbody class="data-tabla" id="data-list-Student">

 
                </tbody>
            </table>
        </section>

    <footer class="footer-table-manage">
          <nav class=sub-container-pagination-table-manage>
            <div class="pagination-table-manage" id="PaginationRender">

            </div>
        </nav>
        <button class="btn-export" onclick="exportarAExcel()">
            Exportar Listado 📄
        </button>
    </footer>
</main>`;


function View_all_Registered_Users(id){



document.getElementById(id).innerHTML=templete_View_all_Registered_Users

/*-------------------------------------------------*/
    document.getElementById("SearchStudent").addEventListener("click",(e)=>{

        
        SearchDataStudent(document.getElementById("inputSearchStudent").value)

    })


    document.getElementById("inputSearchStudent").addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Evita comportamientos extraños
            
            SearchDataStudent(document.getElementById("inputSearchStudent").value);  
        }
    })

    const searchInput = document.getElementById('inputSearchStudent');
    searchInput.focus()
    searchInput.addEventListener('search', function(event) {
          if (this.value === '') {

                api.send("Get-data-Student-list")

          }
        });
/*-------------------------------------------------*/



//Lógica de Dropdowns (Abrir/Cerrar y cerrar al hacer clic fuera) ---
const dropdowns = document.querySelectorAll('.dropdown-table-manage');
dropdowns.forEach(drop => {
    const btn = drop.querySelector('.btn-dropdown-table-manage');
    
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Cerrar otros dropdowns
        dropdowns.forEach(d => { if(d !== drop) d.classList.remove('active'); });
        drop.classList.toggle('active');
    });
});

document.addEventListener('click', () => {
    dropdowns.forEach(d => d.classList.remove('active'));
});

// Evitar que el menú se cierre al hacer clic dentro
document.querySelectorAll('.dropdown-menu-table-manage').forEach(menu => {
    menu.addEventListener('click', (e) => e.stopPropagation());
});

/*----------------------------*/
api.send("Get-data-Student-list")
/*--------------------------------*/
 


}

function exportarAExcel() {
    var table = document.getElementById("tableInscritos");
    var ws = XLSX.utils.table_to_sheet(table);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inscritos");
    XLSX.writeFile(wb, "ReporteInscritos.xlsx");
}



function New_Registration(){

    api.send("Open-registre-new-Student")
}



api.receive("Data-list-Student",(event,info)=>{

    console.log("Data-list-Student",info)

    document.getElementById("data-list-Student").innerHTML='';

    if(info.success==true){
        info.data.forEach((student,info)=>{

            document.getElementById("data-list-Student").innerHTML+=`<tr>
                                <td>${student.Name}</td>
                                <td>${student.Cod_id}</td>
                                <td>${student.Tlf}</td>
                                <td>${student.E_mail}</td>
                                <td>${student.CourseName}</td>
                                <td>${student.Date}/${student.Time}</td>
                             <td class="td-action">
                                <button class="btn-edit-data-table icon-info" onclick="InfoStudent('${student.Key}')"></button>
                                <button class="btn-edit-data-table icon-pencil" onclick="UpdateStudent('${student.Key}')"></button>
                                <button class="btn-delete-data-table icon-bin"  onclick="DeleteStudent('${student.Key}')"></button>
                            </td>
                            </tr>`;

        })
    }
    if(info.success==false){

        document.getElementById("data-list-Student").innerHTML+=`<tr>
                <td colspan="3" style="text-align: center; padding: 20px; color: gray;">
                ${info.message}</td></tr>`

    }


    if(info.pagination["isPaged"]==false){
        document.getElementById("PaginationRender").style.display="none"
    }

    if(info.pagination["isPaged"]==true){
            document.getElementById("PaginationRender").style.display="flex"

           renderPaginationStudient(info.pagination)
    }

})
api.receive("Data-list-Student-serach",(event,info)=>{

    console.log("Data-list-Student-serach",info)
    
    document.getElementById("data-list-Student").innerHTML='';


    if(info.success==true){
        info.data.forEach((student,info)=>{

            document.getElementById("data-list-Student").innerHTML+=`<tr>
                                <td>${student.Name}</td>
                                <td>${student.Cod_id}</td>
                                <td>${student.Tlf}</td>
                                <td>${student.E_mail}</td>
                                <td>${student.CourseName}</td>
                                <td>${student.Date}/${student.Time}</td>
                             <td class="td-action">
                                <button class="btn-edit-data-table icon-info" onclick="InfoStudent('${student.Key}')"></button>
                                <button class="btn-edit-data-table icon-pencil" onclick="UpdateStudent('${student.Key}')"></button>
                                <button class="btn-delete-data-table icon-bin"  onclick="DeleteStudent('${student.Key}')"></button>
                            </td>
                            </tr>`;

        })
    }
    if(info.success==false){

        document.getElementById("data-list-Student").innerHTML+=`<tr>
                <td colspan="3" style="text-align: center; padding: 20px; color: gray;">
                ${info.message}</td></tr>`

    }


})
/*-------------------------------------------------*/
function renderPaginationStudient(data) {
            
            const container = document.getElementById('PaginationRender');
            container.innerHTML = ''; // Limpiar antes de re-dibujar

            // 1. Botón "Anterior"
            const prevBtn = document.createElement('button');
            prevBtn.className = 'page-btn';
            prevBtn.innerText = '«';
            prevBtn.disabled = data.currentPage === 1;
            prevBtn.onclick = () => SearchPaginationStudent(data.currentPage - 1);
            container.appendChild(prevBtn);

            // 2. Botones de Números
            for (let i = 1; i <= data.totalPages; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.innerText = i;
                pageBtn.className ="page-btn";
                
                if (i === data.currentPage) {
                    pageBtn.classList.add('active-page');
                }

                pageBtn.onclick = () => SearchPaginationStudent(i);
                container.appendChild(pageBtn);
            }

            // 3. Botón "Siguiente"
            const nextBtn = document.createElement('button');
            nextBtn.innerText = '»';
            nextBtn.className = 'page-btn';
            nextBtn.disabled = data.currentPage === data.totalPages;
            nextBtn.onclick = () => SearchPaginationStudent(data.currentPage + 1);
            container.appendChild(nextBtn);
}

/*-------------------------------------------------*/

function SearchDataStudent(data){

api.send("Search-Student-data",data)

}


function SearchPaginationStudent(index){

    api.send("search-data-pagination-student",index)

}

function InfoStudent(id){

    console.log(id)
    api.send("Open-system-info-student-register",id)

}

function UpdateStudent(id){

    console.log(id)
    api.send("Open-system-edit-student-register",id)

}

function DeleteStudent(id){

    console.log(id)
    api.send("Deleted-student-register",id)

}