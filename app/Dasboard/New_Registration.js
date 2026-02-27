let template_New_Registration= `<div class="container-new-registre">
    <h1 class="main-title-new-registre">Nueva Inscripción</h1>

    <form class="registration-form">
        <div class="grid-container-new-registre">
            <div class="column">
                <div class="form-group">
                    <label>Nombre Completo</label>
                    <input type="text" placeholder="Ej: Rosa María Pérez Gonzales">
                </div>

                <div class="form-group">
                    <label>Cédula</label>
                    <input type="text" placeholder="Ej: 21783921">
                </div>

                <div class="form-group">
                    <label>Teléfono</label>
                    <input type="tel" placeholder="Ej: 04163003485">
                </div>

                <div class="form-group">
                    <label>Correo Electrónico</label>
                    <input type="email" placeholder="Ej: nombre@correo.com">
                </div>
            </div>

            <div class="column">
                <div class="form-group">
                    <label>Dirección</label>
                    <input type="text" placeholder="Ej: Calle 24 entre Av. Miranda y Av. Libertador">
                </div>

                <div class="form-group">
                    <label>Curso</label>
                    <div class="select-wrapper">
                        <select class="select-input-new-registre">
                            <option value="" disabled selected>Selecciona un Curso</option>
                            <option value="1">Curso de Programación</option>
                            <option value="2">Curso de Diseño</option>
                        </select>
                        <span class="icon-chevron-down custom-arrow"></span> </div>
                </div>

                <div class="form-group">
                    <label>Foto</label>
                    <div class="file-upload-container-new-registre">
                        <div class="file-info">
                            <div class="preview-box">
                                <span class="icon-image"></span> </div>
                            <span class="file-placeholder">Selecciona una imagen</span>
                        </div>
                        <label for="file-input" class="btn-upload">Subir</label>
                        <input type="file" id="file-input" hidden>
                    </div>
                </div>
            </div>
        </div>

        <div class="action-footer">
            <button type="submit" class="btn-confirm">
                Confirmar <span class="icon-checkmark"></span>
            </button>
        </div>
    </form>
</div>`;

function New_Registration(id){

document.getElementById(id).innerHTML=template_New_Registration
}