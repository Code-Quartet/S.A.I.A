const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
/*-------------------------------------*/
const SAIADB = require(path.join(__dirname, '../../src/database_controls/SAIA_manager.js'));
const DB = new SAIADB(path.join(__dirname, '../../database/SAIA.db'));
/*--------------LINK BASE DE DATOS ------------------------*/

    // --- GESTIÓN DE ARCHIVOS .DB ---
    async function respaldarArchivoDB(destino) {
        const dir = path.dirname(destino);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        
        await DB.desconectar();
        fs.copyFileSync(DB.dbPath, destino);
        await DB.conectar();
        return { success: true, path: destino };
    }

    async function importarArchivoDB(origen) {
        if (!fs.existsSync(origen)) throw new Error("Archivo no encontrado.");
        await DB.desconectar();
        fs.copyFileSync(origen, DB.dbPath);
        await DB.conectar();
        return { success: true };
    }

    // --- IMPORTAR / EXPORTAR JSON ---
    async function exportarJSON(filePath) {
        const tablas = await DB.listarTablas();
        const data = {};
        for (const t of tablas) {
            data[t] = await DB.leer(`SELECT * FROM ${t}`);
        }
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return { success: true };
    }

    async function importarJSON(filePath) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        await DB.beginTransaction();
        try {
            for (const tabla in data) {
                if (data[tabla].length === 0) continue;
                const cols = Object.keys(data[tabla][0]).join(', ');
                const placeholders = Object.keys(data[tabla][0]).map(() => '?').join(', ');
                const sql = `INSERT OR REPLACE INTO ${tabla} (${cols}) VALUES (${placeholders})`;
                for (const fila of data[tabla]) {
                    await DB.crear(sql, Object.values(fila));
                }
            }
            await DB.commit();
            return { success: true };
        } catch (e) { 
            await DB.rollback(); 
            throw e; 
        }
    }

    // --- EXPORTAR E IMPORTAR EXCEL ---
    async function exportarTodoAExcel(destPath) {
        const tablas = await DB.listarTablas();
        const wb = XLSX.utils.book_new();

        for (const tabla of tablas) {
            const rows = await DB.leer(`SELECT * FROM ${tabla}`);
            if (rows.length > 0) {
                const ws = XLSX.utils.json_to_sheet(rows);
                XLSX.utils.book_append_sheet(wb, ws, tabla);
            }
        }
        XLSX.writeFile(wb, destPath);
        return { success: true, path: destPath };
    }

    async function importarTodoDesdeExcel(filePath) {
        if (!fs.existsSync(filePath)) throw new Error("Archivo no encontrado.");
        
        const workbook = XLSX.readFile(filePath);
        await DB.beginTransaction();

        try {
            for (const sheetName of workbook.SheetNames) {
                const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" }); 
                if (rows.length === 0) continue;

                const tableInfo = await DB.leer(`PRAGMA table_info(${sheetName})`);
                const validColumns = tableInfo.map(c => c.name);

                for (const row of rows) {
                    const cleanRow = {};
                    validColumns.forEach(col => {
                        cleanRow[col] = row[col] !== undefined && row[col] !== "" ? row[col] : null;
                        if ((col.toLowerCase() === 'date' || col.toLowerCase() === 'fecha') && !cleanRow[col]) {
                            cleanRow[col] = new Date().toISOString().split('T')[0];
                        }
                    });

                    const cols = Object.keys(cleanRow).join(', ');
                    const placeholders = Object.keys(cleanRow).map(() => '?').join(', ');
                    const sql = `INSERT OR REPLACE INTO ${sheetName} (${cols}) VALUES (${placeholders})`;

                    await DB.crear(sql, Object.values(cleanRow));
                }
            }
            await DB.commit();
            return { success: true };
        } catch (error) {
            await DB.rollback();
            throw error;
        }
    }
    async function exportarTablaAExcel(tabla, destPath) {
        const rows = await DB.leer(`SELECT * FROM ${tabla}`);
        if (rows.length === 0) throw new Error(`La tabla ${tabla} está vacía o no existe.`);

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, tabla);

        XLSX.writeFile(wb, destPath);
        return { success: true, path: destPath };
    }
module.exports = {
    respaldarArchivoDB:respaldarArchivoDB,
    importarArchivoDB:importarArchivoDB,
    exportarJSON:exportarJSON,
    importarJSON:importarJSON,
    exportarTodoAExcel:exportarTodoAExcel,
    importarTodoDesdeExcel:importarTodoDesdeExcel,
    exportarTablaAExcel:exportarTablaAExcel

};

/*
{
  respaldarArchivoDB,
    importarArchivoDB,
    exportarJSON,
    importarJSON,
    exportarTodoAExcel,
    importarTodoDesdeExcel
}

*/