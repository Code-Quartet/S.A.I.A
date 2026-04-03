let templete_View_all_Registered_Users=`<main class="container-manage-table">
        <header class="header-table">
            <h1 class="title-table">Todos los Inscritos</h1>
        </header>

        <section class="toolbar-table-manage">
            <div class="search-box-table-manage">
                <input type="search" class="search-input-table-manage" id="inputSearchStudent" placeholder="Buscar Estudiante...">
                <div id="results-preview" class="preview-list-search"></div>
                <button class="btn-search-tabla-manage" id="SearchStudent">
                <span class="icon-search"></span>
                </button>
            </div>
    
    <input class="select-data-manage" type="date" id="fechaFilterData" name="date">
   

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
        <button class="btn-export" id="ExportStudnt" onclick="exportarAExcelStudent()">
            Exportar Listado 📄
        </button>
    </footer>
</main>`;


function View_all_Registered_Users(id){

    document.getElementById(id).innerHTML=templete_View_all_Registered_Users

   /*-------------------------------------------------*/
        if(Data_user.permission=="Sub-Administrador"){

                document.getElementById("ExportStudnt").style.display = 'none'
        }
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

        const resultsPreview = document.getElementById('results-preview');
        let currentIndex = -1; // Rastrea la selección del teclado
        let productosLocal = []; // Guarda los resultados actuales

// Función que se ejecuta al elegir un producto (Click o Enter)
async function ejecutarBusquedaFinal(data) {
    const detalle = SearchDataStudent(data.Cod_id);
    
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
            ejecutarBusquedaFinal(productosLocal[currentIndex]);
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

    productosLocal = await api.buscarSugerencias({table:"Student",terms:query});

    if (productosLocal.length > 0) {
        resultsPreview.innerHTML = '';
        productosLocal.forEach((student, index) => {
            const div = document.createElement('div');
            div.className = 'preview-item-search';
            div.innerHTML = `
                <div>Nombre:${student.Name}</div>
                <div style="margin-left:35px">CI:${student.Cod_id}</div>
            `;
            
            div.onclick = () => ejecutarBusquedaFinal(student);
            
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
/*------------------FILTER DATA-------------------------------*/
const fechaInput = document.getElementById('fechaFilterData');

// 1. Definimos la función que quieres que se ejecute
function miAccionPrincipal() {
    const valor = fechaInput.value;
    if (valor) {
        //console.log("Acción activada con la fecha:", valor);
        api.send("Search-Student-filter-data", valor);
        // Aquí va tu código (ej: filtrar una tabla, hacer un fetch, etc.)
    }
}

// 2. Escuchamos el cambio de valor (al elegir en el calendario)
fechaInput.addEventListener('change', miAccionPrincipal);

// 3. Escuchamos la tecla Enter
fechaInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        miAccionPrincipal();
    }
});

    /*------------------------------------------------------------------*/
    api.send("Get-data-Student-list")
    /*--------------------------------*/
     
}

function exportarAExcelStudent() {


            let obj={
                key:Data_user.key,
                permission:Data_user.permission,
                method:{
                    action:"ExcelExportarUnicoStudent",
                    key:Data_user.key
                    
                }
            }
            api.send("Login-user-master-permission",obj)

   
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
                                <td>${student.CourseNames}</td>
                                <td>${student.Date_Created}/${student.Time_Created}</td>
                             <td class="td-action">
                                <button class="btn-edit-data-table icon-info" onclick="InfoStudent('${student.Key}')"></button>
                                <button class="btn-edit-data-table icon-pencil nosub" onclick="UpdateStudent('${student.Key}')"></button>
                                <button class="btn-delete-data-table icon-bin nosub"  onclick="DeleteStudent('${student.Key}')"></button>
                            </td>
                            </tr>`;

        })


        if(Data_user.permission=="Sub-Administrador"){

                let item = document.querySelectorAll(".nosub")
                    item.forEach((item,index)=>{

                        item.style.display = 'none';
                    })

          }
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
                                <td>${student.CourseNames}</td>
                                <td>${student.Date_Created}/${student.Time_Created}</td>
                                 <td class="td-action">
                                    <button class="btn-edit-data-table icon-info" onclick="InfoStudent('${student.Key}')"></button>
                                    <button class="btn-edit-data-table icon-pencil" onclick="UpdateStudent('${student.Key}')"></button>
                                    <button class="btn-delete-data-table icon-bin"  onclick="DeleteStudent('${student.Key}')"></button>
                                </td>
                            </tr>`;

        })

        if(Data_user.permission=="Sub-Administrador"){

                let item = document.querySelectorAll(".nosub")
                    item.forEach((item,index)=>{

                        item.style.display = 'none';
                    })

          }
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

function DeleteStudent(key){
            let obj={
                key:Data_user.key,
                permission:Data_user.permission,
                method:{
                    action:"Deleted-student-register",
                    key:key
                    
                }
            }
            api.send("Login-user-master-permission",obj)
}