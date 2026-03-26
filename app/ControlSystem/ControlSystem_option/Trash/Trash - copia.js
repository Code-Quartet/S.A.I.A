let templateTrash =`<main class="container-manage-table">
    
     <header class="header-table">
            <h1 class="title-table">Papelera</h1>
     </header>

    <div class="notification-banner" id="banner">
        <span class="icon-info">!</span>
        <span>Después de 30 días en la papelera, los elementos se borran permanentemente.</span>
    </div>

      <section class="toolbar-table-manage">

        <div class="search-box-table-manage">
            <input type="text" class="search-input-table-manage" id="inputSearch" placeholder="Buscar Papelera...">
            <span class="icon-search"></span>
        </div>
        
        <div class="tabs-filter-table-manage">
            <button class="tab-btn active">Inscritos</button>
            <button class="tab-btn">Cursos</button>
            <button class="tab-btn">Instructores</button>
            <button class="tab-btn">Empleados</button>
        </div>

    </section>

     <section class="container-table-manage">
      <table class="data-table">
        <thead>
            <tr>
                <th>Nombre Completo</th>
                <th>Cédula</th>
                <th>Curso</th>
                <th>Fecha de Inscripción</th>
                <th>Fecha de Eliminación</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody id="table-body">

        </tbody>
    </table>
     </section>

    <div class="footer-table-manage">
        <nav class="pagination">
            <button class="page-btn">&lt;</button>
            <button class="page-btn active">1</button> 
            <button class="page-btn">2</button>
            <button class="page-btn">3</button>
            <button class="page-btn">4</button>
            <button class="page-btn">&gt;</button>
        </nav>
        
        <button class="btn-trash">
            Vaciar Papelera <span class="table icon-bin"></span>
        </button>
    </div>
</div>`;
function Trash(id){

document.getElementById(id).innerHTML=templateTrash;

renderTable()
}

const data = [
        { nombre: "Carlos Alexander Soto Fuentes", cedula: "31.234.456", curso: "Dibujo" },
        { nombre: "Jesús Alberto García Castro", cedula: "26.876.543", curso: "Manejo" },
        { nombre: "María Alejandra Pérez González", cedula: "31.234.456", curso: "Fotografía" },
        { nombre: "Carlos José Rodríguez Mora", cedula: "28.765.432", curso: "Dibujo" },
        { nombre: "Ana Isabella Contreras Rojas", cedula: "27.654.321", curso: "Inglés" }
    ];

 
    function renderTable() {
           const tbody = document.getElementById('table-body');

        tbody.innerHTML = data.map(item => `
            <tr>
                <td>${item.nombre}</td>
                <td>${item.cedula}</td>
                <td class="col-blue">${item.curso}</td>
                <td>07/10/2024</td>
                <td>15/10/2024</td>
                    <td class="td-action">
                        <button class="btn-undo-table icon-undo2"></button>
                        <button class="btn-delete-data-table icon-bin" style="margin-left:15px"></button>
                    </td>
            </tr>
        `).join('');
    }

