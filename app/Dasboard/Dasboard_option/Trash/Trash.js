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
            <button class="tab-btn active" id="Student">Inscritos</button>
            <button class="tab-btn" id="Course">Cursos</button>
            <button class="tab-btn" id="Instructor">Instructores</button>
            <button class="tab-btn" id="Employee">Empleados</button>
        </div>

    </section>

     <section class="container-table-manage" id="container-table-manage">

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
 
 api.send("Get-data-Student-list-trash")

        /*---------------------------------------------*/
        document.getElementById("Course").addEventListener("click",(e)=>{

                api.send("Get-data-Course-list-trash")

        })
        document.getElementById("Employee").addEventListener("click",(e)=>{

                api.send("Get-data-registre-employee-trash")

        })
        document.getElementById("Student").addEventListener("click",(e)=>{

                api.send("Get-data-Student-list-trash")


        })
        document.getElementById("Instructor").addEventListener("click",(e)=>{

            api.send("Get-data-instrutor-list-trash")

        })
        /*----------------------------------------------------------*/

}

api.receive("data-list-instructor-trash",async(event,data)=>{

    await RenderTableInstructor(data)
    TestData(data)

})

api.receive("data-list-employee-trash",async(event,data)=>{

    await RenderTableEmployee(data)

})

api.receive("data-list-Student-trash",async(event,data)=>{

    await RenderTableStudent(data)

})

api.receive("data-list-Course-trash",async(event,data)=>{

    await RenderTableCourse(data)

})


function TestData(data){

    console.log(data)

}
/*----------------------------------------------------------*/
function RenderTableCourse(info) {

    document.getElementById("container-table-manage").innerHTML=``;
    document.getElementById("container-table-manage").innerHTML+=`<table>
            <thead>
                <tr>
                   <th>Curso</th><th>Cupo</th><th>Horario</th><th>Instructor</th><th>Inscritos</th><th>Estado</th><th>Acciones</th>
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
                            <td class="td-action">
                                <button class="btn-edit-data-table icon-info" onclick="InfoCourse('${course.Key}')"></button>
                                <button class="btn-edit-data-table icon-pencil" onclick="EditCourse('${course.Key}')"></button>
                                <button class="btn-delete-data-table icon-bin"  onclick="Delete_course('${course.Key}')"></button>
                            </td>
                        </tr>
                    `;

            })
        }

        if(info.success==false){

            table.innerHTML +=`<tr>
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
                            <th>Teléfono</th>
                            <th>Estado</th>
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


}

function RenderTableStudent(info) {

    document.getElementById("container-table-manage").innerHTML=``;
    document.getElementById("container-table-manage").innerHTML+=`<table>
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
                </table>`;

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


}

function RenderTableInstructor(info) {

    document.getElementById("container-table-manage").innerHTML=``;
    document.getElementById("container-table-manage").innerHTML+=`<table class="data-table" id="tablaInstructores">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Especialidad</th>
                        <th>Teléfono</th>
                        <th>Estado</th>
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
                        <td>${Instructor.Tlf}</td>
                        <td ><span class="${Instructor.Status}">${Instructor.Status}</span></td>
                        <td class="td-action">
                            <button onclick="OpenInfoInstructor('${Instructor.Key}')" class="btn-edit-data-table icon-info"></button>
                            <button onclick="OpenEditInstructor('${Instructor.Key}')" class="btn-edit-data-table icon-pencil"></button>
                            <button onclick="DeleteInstructor('${Instructor.Key}')" class="btn-delete-data-table icon-bin" ></button>
                        </td>
                    </tr>`;
           
        });
    }
    if(info.success==false){

         document.getElementById("listInstructor").innerHTML+=`<tr>
            <td colspan="3" style="text-align: center; padding: 20px; color: gray;">
            ${info.message}</td></tr>`

    }


}
/*----------------------------------------------------------*/