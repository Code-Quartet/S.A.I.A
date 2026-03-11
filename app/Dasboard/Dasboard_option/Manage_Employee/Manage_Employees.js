let template_manage_employee=`
<main class="container-manage-table">
        <header class="header-table">
      
            <h1 class="title-table">Gestionar Empleados</h1>
        </header>

        <section class="toolbar-table-manage">
            <div class="search-box-table-manage">
                <input type="text" class="search-input-table-manage" id="inputSearch" placeholder="Buscar employee...">
                <span class="icon-search"></span>
            </div>
            <div class="select-filter-box">
                    <select class="select-dropdown-filter" id="select-dropdown-filter">
                        <option value="">Estado</option>
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                        <option value="despedido">Despedido</option>
                    </select>
            </div>
        <button class="btn-new-data" onclick="RegisterNewEmployee()">
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
                    <tr>
                        <td>Carlos Alexander Soto Fuentes</td>
                        <td>carlos17@correo.com</td>
                        <td>0412-555-2345</td>
                        <td><span class="status inactive">Inactivo</span></td>
                 <td class="td-action">
                        <button class="btn-edit-data-table icon-pencil"></button>
                        <button class="btn-delete-data-table icon-bin" style="margin-left:15px"></button>
                    </td>
                    </tr>
                    <tr>
                        <td>Carlos Alexander Soto Fuentes</td>
                        <td>carlos17@correo.com</td>
                        <td>0412-555-2345</td>
                        <td><span class="status inactive">Inactivo</span></td>
           <td class="td-action">
                        <button class="btn-edit-data-table icon-pencil"></button>
                        <button class="btn-delete-data-table icon-bin" style="margin-left:15px"></button>
                    </td>
                    </tr>
                    <tr>
                        <td>Carlos Alexander Soto Fuentes</td>
                        <td>carlos17@correo.com</td>
                        <td>0412-555-2345</td>
                        <td><span class="status inactive">Inactivo</span></td>
                 <td class="td-action">
                        <button class="btn-edit-data-table icon-pencil"></button>
                        <button class="btn-delete-data-table icon-bin" style="margin-left:15px"></button>
                    </td>
                    </tr>
                    </tbod>
                 </table>
        </section>

        <footer class="footer-table-manage">
        <nav class="pagination">
            <button class="page-btn">&lt;</button>
            <button class="page-btn active">1</button> <button class="page-btn">2</button>
            <button class="page-btn">&gt;</button>
        </nav>

     </footer>
</main>`;

function Manage_Employee(id){

	document.getElementById(id).innerHTML=template_manage_employee;


}

function RegisterNewEmployee(){
    api.send("Open-system-new-employee-register")
}