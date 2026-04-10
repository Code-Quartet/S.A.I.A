let template_manage_employee=`<main class="container-manage-table">
                                    <header class="header-table">  
                                        <h1 class="title-table">Gestionar Empleados</h1>
                                    </header>

                                    <section class="toolbar-table-manage">
                                        <div class="search-box-table-manage">
                                            <input type="search" class="search-input-table-manage" id="inputSearchEmployee" placeholder="Buscar employee...">
                                             <div id="results-preview" class="preview-list-search"></div>
                                            <button class="btn-search-tabla-manage" id="Searchemployee">
                                            <span class="icon-search"></span>
                                            </button>
                                        </div>
                                        <div class="select-filter-box">
                                                <div class="dropdown-table-manage" id="drop-curso">
                    <button class="btn-dropdown-table-manage">
                             Estado ▾
                    </button>
                    <div class="dropdown-menu-table-manage" id="dropdownEstado">
                        <div class="filter-opt">
                            <input type="checkbox" id="chk-activo" value="Activo">
                            Activo
                        </div>
                        <div class="filter-opt">
                            <input type="checkbox" id="chk-inactivo" value="Inactivo">
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
                                    <button class="btn-new-data" id="NewRegisterEmployee">
                                        Nuevo Empleado <span class="icon-user-plus"></span>
                                    </button>
                                    </section>

                                    <section class="container-table-manage">
                                        <table>
                                                <thead>
                                                    <tr>
                                                        <th>Nombre Completo</th>
                                                        <th>Correo Electrónico</th>
                                                        <th>Teléfono</th>
                                                        <th>Estado</th>
                                                        <th>Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="employee-body">
                                  
                                                </tbod>
                                        </table>
                                    </section>

                                    <footer class="footer-table-manage">
                                        <nav class=sub-container-pagination-table-manage>
                                           <div class="pagination-table-manage" id="PaginationRender"> </div>
                                        </nav>
                                        <button class="btn-export" id="ExportEmployee" onclick="exexportarAExcelEmployee()">
                                            Exportar Listado 📄
                                        </button>
                                    </footer>
                            </main>`;

function Manage_Employee(id){

    document.getElementById(id).innerHTML=template_manage_employee;


    /*-------------------------------------------------*/
    if(Data_user.permission=="Sub-Administrador"){

        document.getElementById("ExportEmployee").style.display = 'none'
    }
    /*-------------------------------------------------*/

    const btnNewRegisterEmployee = document.getElementById("NewRegisterEmployee");

    btnNewRegisterEmployee.addEventListener('click', () => {
        
        btnNewRegisterEmployee.disabled = true;

           api.send("Open-system-new-employee-register")
        
    });

/*-------------------------------------------------------------------------------*/


    api.send("Get-data-registre-employee")

        document.getElementById("Searchemployee").addEventListener("click",(e)=>{

        SearchEmployee(document.getElementById("inputSearchEmployee").value)

    })

     /*-------------------------------------------------*/

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
    api.send("search-data-registre-employee-filter",estadosSeleccionados);

 
});

document.querySelector(".btn-reset").addEventListener("click",(e)=>{

    const contenedor = document.getElementById('drop-curso');
    const checkboxes = contenedor.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(chk => {
    chk.checked = false; // Esto quita la marca de "check"
    });
    api.send("Get-data-registre-employee")

})


/*-------------------------------------------------------------------------------*/

    document.getElementById("inputSearchEmployee").addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Evita comportamientos extraños
            SearchEmployee(document.getElementById("inputSearchEmployee").value);  
        }
    })

    const searchInput = document.getElementById('inputSearchEmployee');
    searchInput.focus()
    searchInput.addEventListener('search', function(event) {
          if (this.value === '') {
           // console.log('El campo fue limpiado con la X o Enter');
                api.send("Get-data-registre-employee")

          }
        });

    /*------------------------------------------------------------------------*/
        const resultsPreview = document.getElementById('results-preview');
        let currentIndex = -1; // Rastrea la selección del teclado
        let ArraydataSearchInput = []; // Guarda los resultados actuales

// Función que se ejecuta al elegir un producto (Click o Enter)
async function ejecutarBusquedaFinal(data) {

    console.log(data)

    const detalle = SearchEmployee(data.Name);
    
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

    ArraydataSearchInput = await api.buscarSugerencias({table:"Employee",terms:query});

    if (ArraydataSearchInput.length > 0) {
        resultsPreview.innerHTML = '';
        ArraydataSearchInput.forEach((Employee, index) => {
            const div = document.createElement('div');
            div.className = 'preview-item-search';
            div.innerHTML = `
                <div>Nombre:${Employee.Name}</div>
                <div style="margin-left:35px">CI:${Employee.Cod_id}</div>
            `;
            
            div.onclick = () => ejecutarBusquedaFinal(Employee);
            
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
api.receive("Activate-button-register-employee",(event,data)=>{
    
    const btnNewRegisterEmployee = document.getElementById("NewRegisterEmployee");
    btnNewRegisterEmployee.disabled = false;

})

api.receive("Render-data-employee-list",(event,info)=>{

    console.log("Render-data-employee-list",info)

    document.getElementById("employee-body").innerHTML=""

        if(info.success==true){
            info.data.forEach((employee,index)=>{

                document.getElementById("employee-body").innerHTML+=`<tr>
                                    <td>${employee.Name}</td>
                                    <td>${employee.E_mail}</td>
                                    <td>${employee.Tlf}</td>
                                    <td ><span class="${employee.Status}">${employee.Status}</span></td>
                                  
                                <td class="td-action">
                                    <button class="btn-edit-data-table icon-info" onclick="InfoEmployee('${employee.Key}')"></button>
                                    <button class="btn-edit-data-table icon-pencil" onclick="UpdateEmployee('${employee.Key}')"></button>
                                    <button class="btn-delete-data-table icon-bin"  onclick="DeleteEmployee('${employee.Key}')"></button>
                                </td>
                                </tr>`;

            })
        }
       if(info.success==false){

             document.getElementById("employee-body").innerHTML+=`<tr>
            <td colspan="3" style="text-align: center; padding: 20px; color: gray;">
            ${info.message}</td></tr>`

       }


    if(info.pagination["isPaged"]==false){
        document.getElementById("PaginationRender").style.display="none"
    }
    
    if(info.pagination["isPaged"]==true){
            document.getElementById("PaginationRender").style.display="flex"

           renderPaginationEmployee(info.pagination)

    }


})

api.receive("Render-data-employee-list-search",(event,info)=>{

    document.getElementById("employee-body").innerHTML=""
    if(info.success==true){

    info.data.forEach((employee,index)=>{

        document.getElementById("employee-body").innerHTML+=`<tr>
                            <td>${employee.Name}</td>
                            <td>${employee.E_mail}</td>
                            <td>${employee.Tlf}</td>
                            <td><span class="${employee.Status}">${employee.Status}</sapn></td>
                          
                        <td class="td-action">
                            <button class="btn-edit-data-table icon-info" onclick="InfoEmployee('${employee.Key}')"></button>
                            <button class="btn-edit-data-table icon-pencil" onclick="UpdateEmployee('${employee.Key}')"></button>
                            <button class="btn-delete-data-table icon-bin"  onclick="DeleteEmployee('${employee.Key}')"></button>
                        </td>
                        </tr>`;

        })
    }
       if(info.success==false){

             document.getElementById("employee-body").innerHTML+=`<tr>
            <td colspan="3" style="text-align: center; padding: 20px; color: gray;">
            ${info.message}</td></tr>`

       }

})



function SearchEmployee(data){


api.send("search-data-registre-employee",data)


}

function renderPaginationEmployee(data) {
            
            const container = document.getElementById('PaginationRender');
            container.innerHTML = ''; // Limpiar antes de re-dibujar

            // 1. Botón "Anterior"
            const prevBtn = document.createElement('button');
            prevBtn.className = 'page-btn';
            
            prevBtn.innerText = '«';
            prevBtn.disabled = data.currentPage === 1;
            prevBtn.onclick = () => SearchPaginationEmployee(data.currentPage - 1);
            container.appendChild(prevBtn);

            // 2. Botones de Números
            for (let i = 1; i <= data.totalPages; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.innerText = i;
                pageBtn.className ="page-btn";
                
                if (i === data.currentPage) {
                    pageBtn.classList.add('active-page');
                }

                pageBtn.onclick = () => SearchPaginationEmployee(i);
                container.appendChild(pageBtn);
            }

            // 3. Botón "Siguiente"
            const nextBtn = document.createElement('button');
            nextBtn.innerText = '»';
            nextBtn.className = 'page-btn';
            nextBtn.disabled = data.currentPage === data.totalPages;
            nextBtn.onclick = () => SearchPaginationEmployee(data.currentPage + 1);
            container.appendChild(nextBtn);
}


function SearchPaginationEmployee(index){

    api.send("search-pagination-employee",index)

}

function InfoEmployee(id){

    console.log(id)
    api.send("Open-system-info-employee-register",id)

}

function UpdateEmployee(id){

    console.log(id)
    api.send("Open-system-edit-employee-register",id)

}

function DeleteEmployee(id){

            let obj={
                key:Data_user.key,
                permission:Data_user.permission,
                method:{
                    action:"Deleted-employee-register",
                    key:id
                    
                }
            }
            api.send("Login-user-master-permission",obj)
}



function exexportarAExcelEmployee() {
            let obj={
                key:Data_user.key,
                permission:Data_user.permission,
                method:{
                    action:"ExcelExportarUnicoEmployee",
                    key:Data_user.key
                    
                }
            }

       api.send("Login-user-master-permission",obj)

   
}


/*
toma en cuneta la siguiente tabla // Tabla User
  await DB.crearTabla(`CREATE TABLE User (
    Key TEXT PRIMARY KEY, -- Clave primaria
    Username TEXT NOT NULL UNIQUE,         -- Nombre de usuario único
    Password TEXT NOT NULL,                -- Contraseña
    PasswordMaster TEXT NOT NULL,                -- Contraseña
    Permission TEXT NOT NULL,              -- Permisos del usuario
    Date DATE NOT NULL,                    -- Fecha de creación
    Time TIME NOT NULL,                    -- Hora de creación
    Time_delet DATE                        -- Fecha de eliminación lógica
)`);

// Tabla Employee
  await DB.crearTabla(`CREATE TABLE Employee (
    Key TEXT PRIMARY KEY, -- Clave primaria
    Name TEXT NOT NULL,                    -- Nombre del empleado
    Cod_id TEXT NOT NULL UNIQUE,           -- Código único del empleado
    Address TEXT,                          -- Dirección
    Tlf TEXT,                              -- Teléfono
    E_mail TEXT UNIQUE,                  -- Correo electrónico único
    Image TEXT,
    Age TEXT UNICODE,
    Id_user TEXT UNIQUE,                       -- Relación con la tabla User
    Date DATE NOT NULL,                    -- Fecha de creación
    Time TIME NOT NULL,                    -- Hora de creación
    Time_delet DATE,                       -- Fecha de eliminación lógica
    FOREIGN KEY (Id_user) REFERENCES User(Key) -- Clave foránea
)`);  y dame una función en código que me permita el borrado logico de un employee y a la vez al borrar el employee desactive el usuario q que esa relacionado tambien dame una para borrado permanente 

*/