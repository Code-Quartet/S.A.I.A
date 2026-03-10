let template_register_course =`
<main class="container-manage-table">    
    <header class="header-table">
       
         <h1 class="title-table">Gestionar Cursos</h1>
    </header>

    <section class="toolbar-table-manage">
        <div class="search-box-table-manage">
            <input class="search-input-table-manage" type="text" placeholder="Buscar Curso...">
            <i class="icon-search"></i>
        </div>

        <div class="dropdown-table-manage">
            <button class="btn-dropdown-table-manage">
                Estado ▾
            </button>
            <div class="dropdown-menu-table-manage" id="dropFiltro">
                <div class="filter-opt"><input type="checkbox"> Activo</div>
                <div class="filter-opt"><input type="checkbox"> En Pausa</div>
                <div class="filter-opt"><input type="checkbox"> Cancelado</div>
                <div class="filter-opt"><input type="checkbox"> Completado</div>
                <div class="menu-footer">
                    <button class="btn-apply" style="padding:5px;">Aplicar</button>
                    <button class="btn-reset" style="padding:5px; font-size:0.7rem;">Limpiar</button>
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
               <th>Curso</th><th>Cupo</th><th>Horario</th><th>Instructor</th><th>Estado</th><th>Acciones</th>
            </tr>
        </thead>
        <tbody id="listaCursos">
        </tbody>
    </table>
    </section>

    <footer class="footer-table-manage">
        
        <nav class="pagination">
            <button class="page-btn">&lt;</button>
            <button class="page-btn active">1</button> <button class="page-btn">2</button>
            <button class="page-btn">&gt;</button>
        </nav>

        <button class="btn-export" onclick="exportarAExcel()">
            Exportar Listado 📄
        </button>
    </footer>
</main>`;
function Manage_course(id){

document.getElementById(id).innerHTML=template_register_course;

/*-------------------------------------------------------------*/
rendertable()



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

/*-------------------------------------------------------------*/
}

      const cursos = [
            { id: 1, nombre: 'Inglés', cupo: 15, horario: 'Lun-Vie 8am', instructor: 'Carlos Soto', estado: 'En Pausa' },
            { id: 2, nombre: 'Fotografía', cupo: 8, horario: 'Mar-Jue 2pm', instructor: 'Cristian Blanco', estado: 'Activo' },
            { id: 3, nombre: 'Fotografía', cupo: 8, horario: 'Mar-Jue 2pm', instructor: 'Cristian Blanco', estado: 'Activo' },
            { id: 4, nombre: 'Fotografía', cupo: 8, horario: 'Mar-Jue 2pm', instructor: 'Cristian Blanco', estado: 'Activo' },
            { id: 5, nombre: 'Fotografía', cupo: 8, horario: 'Mar-Jue 2pm', instructor: 'Cristian Blanco', estado: 'Activo' }
        ];

        function rendertable() {
            const table = document.getElementById('listaCursos');
            table.innerHTML = cursos.map(c => `
                <tr>
                    <td>${c.nombre}</td><td>${c.cupo}</td><td>${c.horario}</td><td>${c.instructor}</td>
                    <td><span class="badge ${c.estado === 'Activo' ? 'bg-activo' : 'bg-pausa'}">${c.estado}</span></td>
                    <td class="td-action">
                        <button class="btn-edit-data-table icon-pencil"></button>
                        <button class="btn-delete-data-table icon-bin" style="margin-left:15px"></button>
                    </td>
                </tr>
            `).join('');
        }


function OpenNewCourse(){

    api.send("Open-system-new-course-register")
    
}

function EditCourse(){

  api.send("Open-system-edit-course-register")

}




