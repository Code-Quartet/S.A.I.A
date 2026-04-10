let templateTrash =`<main class="container-manage-table-trash">
    
     <header class="header-table">
            <h1 class="title-table">Papelera</h1>
            <div class="notification-banner" id="banner">
                <span class="icon-info">!</span>
                <span>Después de 30 días en la papelera, los elementos se borran permanentemente.</span>
            </div>
     </header>

    <section class="toolbar-table-manage">

        <div class="search-box-table-manage">
            <input type="search" class="search-input-table-manage" id="inputSearchTrash" placeholder="Buscar Papelera...">
            <div id="results-preview" class="preview-list-search"></div> 

            <button class="btn-search-tabla-manage"id="searchTrashData">
                    <span class="icon-search"></span>
            </button>
        </div>
        
        <div class="tabs-filter-table-manage">
            <button class="tab-btn ActiveButtonTrash" id="Student">Inscritos</button>
            <button class="tab-btn" id="Course">Cursos</button>
            <button class="tab-btn" id="Instructor">Instructores</button>
            <button class="tab-btn" id="Employee">Empleados</button>
        </div>

    </section>

     <section class="container-table-manage" id="container-table-manage">

     </section>

    <footer class="footer-table-manage">
          <nav class=sub-container-pagination-table-manage>
            <div class="pagination-table-manage" id="PaginationRender">

            </div>
        </nav>
        <button class="btn-trash" onclick="TrashAllDataBase()">
            Vaciar Papelera <span class="table icon-bin"></span>
        </button>
    </footer>
</div>`;
let TypeTableSelect="";



function Trash(id){

        document.getElementById(id).innerHTML=templateTrash;
 
            api.send("Get-data-Student-list-trash")

        /*---------------------------------------------*/
        document.getElementById("Course").addEventListener("click",(e)=>{

                api.send("Get-data-Course-list-trash")
                EfectoColorMenuItemTrash()
               


        })
        document.getElementById("Employee").addEventListener("click",(e)=>{

                api.send("Get-data-registre-employee-trash")
                EfectoColorMenuItemTrash()
                

        })
        document.getElementById("Student").addEventListener("click",(e)=>{

                api.send("Get-data-Student-list-trash")
                EfectoColorMenuItemTrash()
                


        })
        document.getElementById("Instructor").addEventListener("click",(e)=>{

            api.send("Get-data-instrutor-list-trash")
            EfectoColorMenuItemTrash()
             
        })
        /*----------------------------------------------------------*/

   document.getElementById("inputSearchTrash").focus()     
 document.getElementById("searchTrashData").addEventListener("click",(e)=>{

        
        SearchData(document.getElementById("inputSearchTrash").value,TypeTableSelect)

    })


    document.getElementById("inputSearchTrash").addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Evita comportamientos extraños
            
            SearchData(document.getElementById("inputSearchTrash").value,TypeTableSelect);  
        }
    })
    /*----------------------------------------------------------*/

    let searchInput = document.getElementById("inputSearchTrash")
            const resultsPreview = document.getElementById('results-preview');
        let currentIndex = -1; // Rastrea la selección del teclado
        let ArraydataSearchInput = []; // Guarda los resultados actuales

// Función que se ejecuta al elegir un producto (Click o Enter)
async function ejecutarBusquedaFinal(data) {

    console.log(data)

    const detalle = SearchData(data.Name,TypeTableSelect);
    
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

    ArraydataSearchInput = await api.buscarSugerenciasTrash({tabla:TypeTableSelect,terms:query});

    if (ArraydataSearchInput.length > 0) {
        resultsPreview.innerHTML = '';
        ArraydataSearchInput.forEach((DataTrashSugerida, index) => {
            const div = document.createElement('div');
            div.className = 'preview-item-search';
            div.innerHTML = `
                <div>Nombre:${DataTrashSugerida.Name}</div`;
            
            div.onclick = () => ejecutarBusquedaFinal(DataTrashSugerida);
            
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

/*-------------------------------------------------------------------------------*/


}
/*-------------------------------------------------*/
function SearchData(terms,tabla){
let OBJ = {
    tabla:tabla,
    terms:terms
}
    console.log("Search-data-trash",OBJ)
    api.send("Search-data-trash",OBJ)

}

api.receive("Search-data-trash-send",(event,info)=>{


if(info.table=="Student"){
    RenderTableStudent(info)
}
if(info.table=="Course"){
    RenderTableCourse(info)
}
if(info.table=="Employee"){
    RenderTableEmployee(info)
}
if(info.table=="Instructor"){
    RenderTableInstructor(info)
}



})
/*-------------------------------------------------*/

function EfectoColorMenuItemTrash(){

    let ItmeMenu = document.querySelectorAll('.tab-btn');
    ItmeMenu.forEach(function(element,index) {
       
       element.onclick = function() {
        
           ItmeMenu.forEach((item) => {

                item.classList.remove("ActiveButtonTrash");

            });
            this.classList.add("ActiveButtonTrash");
        }
    });
}


api.receive("data-list-instructor-trash",async(event,data)=>{

    await RenderTableInstructor(data)
    TypeTableSelect="Instructor"
    //TestData(data)

})

api.receive("data-list-employee-trash",async(event,data)=>{

    await RenderTableEmployee(data)
    TypeTableSelect="Employee"
     //TestData(data)

})

api.receive("data-list-Student-trash",async(event,data)=>{

    await RenderTableStudent(data)
    TypeTableSelect="Student"
     //TestData(data)

})

api.receive("data-list-Course-trash",async(event,data)=>{

    await RenderTableCourse(data)
     TypeTableSelect="Course"
     //TestData(data)

})


/*----------------------------------------------------------*/
function RenderTableCourse(info) {

    document.getElementById("container-table-manage").innerHTML=``;
    document.getElementById("container-table-manage").innerHTML+=`<table>
            <thead>
                <tr>
                   <th>Curso</th>
                   <th>Cupo</th>
                   <th>Horario</th>
                   <th>Instructor</th>
                   <th>Inscritos</th>
                   <th>Estado</th>
                   <th>F. registro</th>
                   <th>F. borrado</th>
                   <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="listaCursos">
            </tbody>
        </table>`;
        if(info.success==true){
            info.data.forEach((course,index)=>{

                    document.getElementById("listaCursos").innerHTML += `
                        <tr>
                            <td>${course.Name}</td>
                            <td>${course.Capacity}</td>
                            <td>${course.Start_Time}/${course.End_Time}</td>
                            <td>${course.Instructor_Name}</td>
                            <td>${course.Total_Students}/${course.Capacity}</td>
                            <td><span class="${course.Status}">${course.Status}</span></td>
                            <td>${course.Date_Created}</td>
                            <td>${course.Time_Deleted}</td>
                            <td class="td-action">
                                <button class="btn-edit-data-table icon-undo2 " onclick="RestoreData('${course.Key}','Course')">
                                </button>
                                 <button class="btn-delete-data-table icon-bin"  onclick="OpenDeletedPermanenData('${course.Key}','Course')"></button>
                            </td>
                        </tr>`;

            })

            /*pagination*/
            ChargePagination(info,"Course")
        }

        if(info.success==false){

            document.getElementById("listaCursos").innerHTML +=`<tr>
                    <td colspan="3" style="text-align: center; padding: 20px; color: gray;">
                    ${info.message}</td></tr>`

        }
}

function RenderTableEmployee(info) {

    document.getElementById("container-table-manage").innerHTML=``;
    document.getElementById("container-table-manage").innerHTML+=` <table>
                    <thead>
                        <tr>
                            <th>Nombre Completo</th>
                            <th>Correo Electrónico</th>
                            <th>Estado</th>
                             <th>F. registro</th>
                   <th>F. borrado</th>
                            <th>Acciones</th>

                        </tr>
                    </thead>
                    <tbody id="employee-body">
      
                    </tbod>
            </table>`;

        if(info.success==true){
            info.data.forEach((employee,index)=>{

                document.getElementById("employee-body").innerHTML+=`<tr>
                                    <td>${employee.Name}</td>
                                    <td>${employee.E_mail}</td>
                                    <td ><span class="${employee.Status}">${employee.Status}</span></td>
                                                              <td>${employee.Date_Created}</td>
                            <td>${employee.Time_Deleted}</td>
                                <td class="td-action">
                                    <button class="btn-edit-data-table icon-undo2
                                " onclick="RestoreData('${employee.Key}','Employee')"></button>
                                  <button class="btn-delete-data-table icon-bin"  onclick="OpenDeletedPermanenData('${employee.Key}','Employee')"></button>
                                </td>
                                </tr>`;

            })
            /*pagination*/
            ChargePagination(info,"Employee")

        }
       if(info.success==false){

             document.getElementById("employee-body").innerHTML+=`<tr>
            <td colspan="3" style="text-align: center; padding: 20px; color: gray;">
            ${info.message}</td></tr>`

       }

}

function RenderTableStudent(info) {

    document.getElementById("container-table-manage").innerHTML=``;
    document.getElementById("container-table-manage").innerHTML+=`<table>
                    <thead>
                        <tr>
                            <th>Nombre Completo</th>
                            <th>Cédula</th>
                            <th>Curso</th>
                            <th>Fecha de Inscripción</th>
                                               <th>F. registro</th>
                   <th>F. borrado</th>
                             <th>Acciones</th>

                        </tr>
                    </thead>
                    <tbody class="data-tabla" id="data-list-Student">

     
                    </tbody>
                </table>`;

    if(info.success==true){
        info.data.forEach((student,info)=>{

            document.getElementById("data-list-Student").innerHTML+=`<tr>
                                <td>${student.Name}</td>
                                <td>${student.Cod_id}</td>
                                <td>${student.CourseNames}</td>
                                <td>${student.Date_Created}/${student.Time_Created}</td>
                             <td>${student.Date_Created}</td>
                            <td>${student.Time_Deleted}</td>
                             <td class="td-action">
                                <button class="btn-edit-data-table icon-undo2" onclick="RestoreData('${student.Key}','Student')"></button>
                                <button class="btn-delete-data-table icon-bin"  onclick="OpenDeletedPermanenData('${student.Key}','Student')"></button>
                            </td>
                            </tr>`;

        })
        /*pagination*/
        ChargePagination(info,"Student")

    }
    if(info.success==false){

        document.getElementById("data-list-Student").innerHTML+=`<tr>
                <td colspan="3" style="text-align: center; padding: 20px; color: gray;">
                ${info.message}</td></tr>`

    }

}

function RenderTableInstructor(info) {

    document.getElementById("container-table-manage").innerHTML=``;
    document.getElementById("container-table-manage").innerHTML+=`<table class="data-table" id="tablaInstructores">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Especialidad</th>
                        <th>Estado</th>
                        <th>F. registro</th>
                   <th>F. borrado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="listInstructor">

                </tbody>
            </table>`;

    if(info.success==true){

        info.data.forEach(function(Instructor,index){

            document.getElementById("listInstructor").innerHTML+=`<tr>
                        <td>${Instructor.Name}</td>
                        <td>${Instructor.Specialty}</td>
                        <td ><span class="${Instructor.Status}">${Instructor.Status}</span></td>
                        <td>${Instructor.Date_Created}</td>
                        <td>${Instructor.Time_Deleted}</td>
                        <td class="td-action">
                            <button onclick="RestoreData('${Instructor.Key}','Instructor')" class="btn-edit-data-table icon-undo2"></button>
                            <button onclick="OpenDeletedPermanenData('${Instructor.Key}','Instructor')" class="btn-delete-data-table icon-bin" ></button>
                        </td>
                    </tr>`;
           
        });
        /*pagination*/
        ChargePagination(info,"Instructor")

    }
    if(info.success==false){

         document.getElementById("listInstructor").innerHTML+=`<tr>
            <td colspan="3" style="text-align: center; padding: 20px; color: gray;">
            ${info.message}</td></tr>`

    }

}
/*----------------------------------------------------------*/

function ChargePagination(infopage,action){

    console.log(infopage)
    if(infopage.pagination["isPaged"]==false){
    
        document.getElementById("PaginationRender").style.display="none"
    
    }

    if(infopage.pagination["isPaged"]==true){

            document.getElementById("PaginationRender").style.display="flex"
            renderPagination(infopage.pagination,action)
                        
     }
}
/*------------------------------------------------------------*/
function renderPagination(data,action) {
            
            const container = document.getElementById('PaginationRender');
            container.innerHTML = ''; // Limpiar antes de re-dibujar

            // 1. Botón "Anterior"
            const prevBtn = document.createElement('button');
            prevBtn.className = 'page-btn';
            prevBtn.innerText = '«';
            prevBtn.disabled = data.currentPage === 1;
            prevBtn.onclick = () => SearchPagination(data.currentPage - 1,action);
            container.appendChild(prevBtn);

            // 2. Botones de Números
            for (let i = 1; i <= data.totalPages; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.innerText = i;
                pageBtn.className ="page-btn";
                
                if (i === data.currentPage) {
                    pageBtn.classList.add('active-page');
                }

                pageBtn.onclick = () => SearchPagination(i,action);
                container.appendChild(pageBtn);
            }

            // 3. Botón "Siguiente"
            const nextBtn = document.createElement('button');
            nextBtn.innerText = '»';
            nextBtn.className = 'page-btn';
            nextBtn.disabled = data.currentPage === data.totalPages;
            nextBtn.onclick = () => SearchPagination(data.currentPage + 1,action);
            container.appendChild(nextBtn);
}

function SearchPagination(data,action){

    //console.log("Get-data-page-list-trash",{pos:data,action:action})
    api.send("Get-data-page-list-trash",{pos:data,action:action})

}

/*----------------------------------------------------------*/
function RestoreData(key,action){

        let obj={
            key:Data_user.key,
            permission:Data_user.permission,
            method:{
                action:"Restore"+action,
                key:key
                
            }
        }
        console.log("Login-user-master-permission",obj)
        api.send("Login-user-master-permission",obj)

}

function OpenDeletedPermanenData(key,action){

    let obj={
                key:Data_user.key,
                permission:Data_user.permission,
                method:{
                    action:"PermanentlyDelete"+action,
                    key:key
                    
                }
            } 

    api.send("Open-alert-message-modal",obj)


}

/*----------------------------------------------------------*/

function TrashAllDataBase(){

        let obj={
           key:Data_user.key,
                permission:Data_user.permission,
            method:{
                action:"ClearTrashDataBase",
                key:null
                
            }
        }
        api.send("Open-message-alert-clear-trash",obj)
}


/*---------------------------------------------------------*/