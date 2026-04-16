let template_manage_Dasboard = `    
<main class="dashboard-main-container">
    <section class="dashboard-metrics-grid">
        <div class="dashboard-metric-card">
            <h3>Estudiantes Totales</h3>
            <p id="TotalStudents">0</p>
        </div>
        <div class="dashboard-metric-card">
            <h3>Cursos Activos</h3>
            <p id="TotalCourses">0</p>
        </div>
        <div class="dashboard-metric-card">
            <h3>Instructores</h3>
            <p id="TotalInstructors">0</p>
        </div>
    </section>
    <section class="dashboard-information-section">
        <section class="dashboard-charts-section">
            <div class="dashboard-panel">
                <div class="dashboard-panel-header">
                    <h2>Estatus de Cursos</h2>
                    <span class="icon-stats-bars"></span>
                </div>
                <div style="height: 250px;"><canvas id="chartCourses"></canvas></div>
            </div>
            <div class="dashboard-panel">
                <div class="dashboard-panel-header">
                    <h2>Estatus de Instructores</h2>
                    <span class="icon-pie-chart"></span>
                </div>
                <div style="height: 250px;"><canvas id="chartInstructors"></canvas></div>
            </div>
        </section>

        <section class="dashboard-data-section">
            <div class="dashboard-panel">
                <div class="dashboard-panel-header">
                    <h2>Cursos Disponibles</h2>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>CURSO</th>
                            <th>DÍAS</th>
                            <th>HORARIO</th>
                            <th>COSTO</th>
                            <th>ESTADO</th>
                        </tr>
                    </thead>
                    <tbody id="TableCourseDasboard"></tbody>
                </table>
            </div>

            <div class="dashboard-panel">
                <div class="dashboard-panel-header">
                    <h2>Historial de Acceso</h2>
                    <span class="icon-history"></span>
                </div>
                <div class="dashboard-session-history" id="dashboard-session-history-list"></div>
            </div>
        </section>
     </section>

</main>`;

function Manage_dasboard(id) {
    const container = document.getElementById(id);
    if (!container) return;

    container.innerHTML = template_manage_Dasboard;

    // Solicitar datos al main process
    api.send("Get-data-stats-dasboard");
}

// --- Recepción de Cursos ---
api.receive("Data-list-course-dasboard", (event, courseList) => {

    const tableBody = document.getElementById("TableCourseDasboard");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (courseList && courseList.success) {
        courseList.data.forEach(course => {
            tableBody.innerHTML += `
                <tr class="tr-data-table">
                    <td><strong>${course.Name}</strong></td>
                    <td>${course.Days}</td>
                    <td>${course.Start_Time} - ${course.End_Time}</td>
                    <td>${course.Cost}</td>
                    <td><span class="status-pill ${course.Status}">${course.Status}</span></td>
                </tr>`;
        });
    } else {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: gray;">
            ${courseList.message || "No hay cursos disponibles"}</td></tr>`;
    }
});

// --- Recepción de Estadísticas y Gráficos ---
api.receive("Data-stats-dasboard", async (event, dasboard) => {

        if (!dasboard || !dasboard.success) return;

        const info = dasboard.data;
        
        // Corregido: Los IDs deben coincidir con el HTML superior/*
        document.getElementById("TotalStudents").innerHTML = info.students.total;
        document.getElementById("TotalInstructors").innerHTML = info.instructors.total;
        document.getElementById("TotalCourses").innerHTML = info.courses.byStatus.activo;

        renderCharts(dasboard);

});

// --- Recepción de Historial ---
api.receive("List-history-data-user", (event, historyList) => {
    const historyContainer = document.getElementById("dashboard-session-history-list");
    if (!historyContainer) return;

    historyContainer.innerHTML = "";

    if (historyList && historyList.success) {
        historyList.data.forEach(history => {
            const dotClass = history.Event_Type === 'LOGIN' ? 'dashboard-login' : 'dashboard-logout';
            historyContainer.innerHTML += `
                <div class="dashboard-session-item">
                    <div class="dashboard-event-dot ${dotClass}"></div>
                    <div class="dashboard-session-info">
                        <strong>Usuario: ${history.Username}</strong>
                        <span>${history.Date_Created} | ${history.Time_Created} (${history.Event_Type})</span>
                    </div>
                </div>`;
        });
    } else {
        historyContainer.innerHTML = `<p style="text-align: center; color: gray; padding: 10px;">
            ${historyList.message || "Sin historial"}</p>`;
    }
});

function renderCharts(dasboard) {
    const info = dasboard.data;

    // Gráfica Cursos
    new Chart(document.getElementById('chartCourses'), {
        type: 'doughnut',
        data: {
            labels: ['Activo', 'Pausa', 'Cancelado', 'Completado'],
            datasets: [{
                data: [
                    info.courses.byStatus.activo || 0,
                    info.courses.byStatus.pausa || 0,
                    info.courses.byStatus.cancelado || 0,
                    info.courses.byStatus.completado || 0
                ],
                backgroundColor: ['#28a745', '#ffc107', '#dc3545', '#0056b3'],
                borderWidth: 2
            }]
        },
        options: { 
            maintainAspectRatio: false, 
            plugins: { legend: { position: 'bottom' } } 
        }
    });

    // Gráfica Instructores
    new Chart(document.getElementById('chartInstructors'), {
        type: 'pie',
        data: {
            labels: ['Activo', 'Inactivo', 'Despedido'],
            datasets: [{
                data: [
                    info.instructors.byStatus.activo || 0,
                    info.instructors.byStatus.inactivo || 0,
                    info.instructors.byStatus.despedido || 0
                ],
                backgroundColor: ['#28a745', '#6c757d', '#dc3545'],
                borderWidth: 2
            }]
        },
        options: { 
            maintainAspectRatio: false, 
            plugins: { legend: { position: 'bottom' } } 
        }
    });
}