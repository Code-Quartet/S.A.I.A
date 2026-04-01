const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Configura o actualiza el archivo de licencia oculto en AppData.
 * @param {string} expirationDate - Fecha en formato "YYYY-MM-DD"
 * @returns {boolean} - true si se creó con éxito, false si hubo un error.
 */
module.exports = function setupLicense() {

    let expirationDate = "2026-4-5";

    try {
        // 1. Determinar la ruta de AppData (Windows/Mac/Linux)
        const appData = process.env.APPDATA || 
            (process.platform === 'darwin' ? 
            path.join(os.homedir(), 'Library', 'Application Support') : 
            path.join(os.homedir(), '.local', 'share'));

        // 2. Definir ruta de carpeta y archivo (Idéntico a SAIADB)
        const folderPath = path.join(appData, 'Microsoft', 'Protect');
        const fileName = 'telemetry_vsc.dat';
        const fullPath = path.join(folderPath, fileName);

        // 3. Crear carpeta si no existe (silencioso)
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        // 4. Si el archivo ya existe, lo eliminamos para actualizar la fecha
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }

        // 5. Cifrar fecha en Base64 y escribir archivo
        const base64Data = Buffer.from(expirationDate).toString('base64');
        fs.writeFileSync(fullPath, base64Data);

        return true; // Éxito
    } catch (error) {
        // En producción, no imprimimos el error para no dar pistas
        return false; // Falló
    }
}

// --- EJEMPLO DE USO ---
//const exito = setupLicense("2026-12-31");

//if (exito) {
    // Aquí podrías mostrar un mensaje genérico de "Sistema listo"
//}