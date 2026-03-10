let templete_View_all_Registered_Users=`
<main class="container-manage-table"> 
        <header class="header-table">
         
            <h1 class="title-table">Todos los Inscritos</h1>
        </header>

        <section class="toolbar-table-manage">
            <div class="search-box-table-manage">
                <input class="search-input-table-manage"  type="text" placeholder="Buscar">
                 <i class="icon-search"></i>
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
                    </tr>
                </thead>
                <tbody class="data-tabla">
                    <tr>
                        <td>Carlos Alexander Soto Fuentes</td>
                        <td>28.123.456</td>
                        <td>0412-555-2345</td>
                        <td>carlos17@correo.com</td>
                        <td>Manejo</td>
                        <td>15/10/2024</td>
                    </tr>
                    <tr>
                        <td>Jesús Alberto García Castro</td>
                        <td>30.789.123</td>
                        <td>0416-555-2345</td>
                        <td>j.garcia@correo.com</td>
                        <td>Inglés</td>
                        <td>14/10/2024</td>
                    </tr>
                    <tr>
                        <td>Carlos Alexander Soto Fuentes</td>
                        <td>28.123.456</td>
                        <td>0412-555-2345</td>
                        <td>carlos17@correo.com</td>
                        <td>Manejo</td>
                        <td>15/10/2024</td>
                    </tr>
                    <tr>
                        <td>Jesús Alberto García Castro</td>
                        <td>30.789.123</td>
                        <td>0416-555-2345</td>
                        <td>j.garcia@correo.com</td>
                        <td>Inglés</td>
                        <td>14/10/2024</td>
                    </tr>
                    <tr>
                        <td>María Alejandra Pérez González</td>
                        <td>31.234.456</td>
                        <td>0424-555-5678</td>
                        <td>perez@correo.com</td>
                        <td>Dibujo</td>
                        <td>13/10/2024</td>
                    </tr>
                                    <tr>
                        <td>Carlos Alexander Soto Fuentes</td>
                        <td>28.123.456</td>
                        <td>0412-555-2345</td>
                        <td>carlos17@correo.com</td>
                        <td>Manejo</td>
                        <td>15/10/2024</td>
                    </tr>
                    <tr>
                        <td>Jesús Alberto García Castro</td>
                        <td>30.789.123</td>
                        <td>0416-555-2345</td>
                        <td>j.garcia@correo.com</td>
                        <td>Inglés</td>
                        <td>14/10/2024</td>
                    </tr>
                    <tr>
                        <td>Carlos Alexander Soto Fuentes</td>
                        <td>28.123.456</td>
                        <td>0412-555-2345</td>
                        <td>carlos17@correo.com</td>
                        <td>Manejo</td>
                        <td>15/10/2024</td>
                    </tr>
                    <tr>
                        <td>Jesús Alberto García Castro</td>
                        <td>30.789.123</td>
                        <td>0416-555-2345</td>
                        <td>j.garcia@correo.com</td>
                        <td>Inglés</td>
                        <td>14/10/2024</td>
                    </tr>
                    <tr>
                        <td>María Alejandra Pérez González</td>
                        <td>31.234.456</td>
                        <td>0424-555-5678</td>
                        <td>perez@correo.com</td>
                        <td>Dibujo</td>
                        <td>13/10/2024</td>
                    </tr>
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


function View_all_Registered_Users(id){

document.getElementById(id).innerHTML=templete_View_all_Registered_Users

/*-------------------------------------------------*/
    // --- Lógica de Dropdowns (Abrir/Cerrar y cerrar al hacer clic fuera) ---
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




    // Lógica visual simple para la paginación
    const pageButtons = document.querySelectorAll('.page-btn:not(.disabled)');
    pageButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if(btn.innerText !== '<' && btn.innerText !== '>') {
                pageButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });
    });

    // --- Lógica de Exportación a Excel ---


}

    function exportarAExcel() {
        var table = document.getElementById("tableInscritos");
        var ws = XLSX.utils.table_to_sheet(table);
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Inscritos");
        XLSX.writeFile(wb, "ReporteInscritos.xlsx");
    }
/*-------------------------------------------------*/
