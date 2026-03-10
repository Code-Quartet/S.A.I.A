let TemplanteManageInstructor=`
<main class="container-manage-table">
   
    <header class="header-table">
     
        <h1 class="title-table">Gestionar Instructores</h1>
    </header>

    <section class="toolbar-table-manage">

        <div class="search-box-table-manage">
            <input type="text" class="search-input-table-manage" id="inputSearch" placeholder="Buscar instructor...">
            <span class="icon-search"></span>
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
                            <input type="checkbox" id="chk-inactivo" value="Inactivo">
                            Inactivo
                        </div>
                        <div class="filter-opt">
                            <input type="checkbox" id="chk-despedido" value="Despedido">
                           Despedido
                        </div>
                        <div class="filter-opt">
                            <input type="checkbox" id="chk-finalizado" value="Finalizado">
                           Curso Finalizado
                        </div>
                        <div class="menu-footer">
                            <button class="btn-apply">Aplicar</button>
                            <button class="btn-reset">Limpiar</button>
                        </div>
                    </div>
                </div>
            </div>

        <button class="btn-new-data">
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
            <tbody>
                <tr>
                    <td>Carlos Soto Fuentes</td>
                    <td>Manejo</td>
                    <td>0412-555-2134</td>
                    <td><span class="status-badge inactivo">Inactivo</span></td>
                <td class="td-action">
                        <button class="btn-edit-data-table icon-pencil"></button>
                        <button class="btn-delete-data-table icon-bin" style="margin-left:15px"></button>
                    </td>
                </tr>
                <tr>
                    <td>Jesús Alberto García</td>
                    <td>Inglés</td>
                    <td>0416-555-2134</td>
                    <td><span class="status-badge activo">Activo</span></td>
                <td class="td-action">
                        <button class="btn-edit-data-table icon-pencil"></button>
                        <button class="btn-delete-data-table icon-bin" style="margin-left:15px"></button>
                    </td>
                </tr>
                <tr>
                    <td>Ana Isabella Contreras</td>
                    <td>Fotografía</td>
                    <td>0412-555-3456</td>
                    <td><span class="status-badge despedido">Despedido</span></td>
                 <td class="td-action">
                        <button class="btn-edit-data-table icon-pencil"></button>
                        <button class="btn-delete-data-table icon-bin" style="margin-left:15px"></button>
                    </td>
                </tr>
                <tr>
                    <td>Pedro Antonio Rojas</td>
                    <td>Dibujo</td>
                    <td>0416-555-4567</td>
                    <td><span class="status-badge finalizado">Curso Finalizado</span></td>
                    <td class="td-action">
                        <button class="btn-edit-data-table icon-pencil"></button>
                        <button class="btn-delete-data-table icon-bin" style="margin-left:15px"></button>
                    </td>
                </tr>
            </tbody>
        </table>
    </section>

    <footer class="footer-table-manage">
        
        <nav class="pagination">
            <button class="page-btn">&lt;</button>
            <button class="page-btn active">1</button> 
            <button class="page-btn">2</button>
            <button class="page-btn">3</button>
            <button class="page-btn">4</button>
            <button class="page-btn">&gt;</button>
        </nav>

        <button class="btn-export" onclick="exportarAExcel()">
            Exportar Listado 📄
        </button>

    </footer>
</main>`;

function Manage_Instructor(id){

	document.getElementById(id).innerHTML=TemplanteManageInstructor;
    // Toggle Menu
// Dropdown de Filtro
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

}
    function aplicarFiltros() {
        const checks = menu.querySelectorAll('input:checked');
        const valores = Array.from(checks).map(c => c.value);
        console.log("Filtrando por:", valores);
        menu.classList.remove('show');
    }

    function restablecerFiltros() {
        menu.querySelectorAll('input').forEach(i => i.checked = false);
    }
