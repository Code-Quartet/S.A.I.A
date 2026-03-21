const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx'); // Nueva dependencia para Excel


class SAIADB {
    constructor(dbPath = './SAIA.db') {
        this.dbPath = dbPath;
        this.db = null;
        this.inTransaction = false;
    }

    // --- MÉTODOS DE CONEXIÓN Y NÚCLEO ---

    async _ensureConnection() {
        if (this.db) return true;
        await this.conectar();
        if (!this.db) throw new Error("Fallo al conectar a la BD.");
        return true;
    }

    conectar() {
        return new Promise((resolve, reject) => {
            if (this.db) return resolve(true);
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) { this.db = null; reject(err); }
                else resolve(true);
            });
        });
    }

    async desconectar() {
        return new Promise((resolve, reject) => {
            if (!this.db) return resolve(true);
            this.db.close((err) => {
                if (err) reject(err);
                else { this.db = null; this.inTransaction = false; resolve(true); }
            });
        });
    }

    // --- MÉTODOS DE CONSULTA (INTERNAL) ---

    async _runQuery(sql, params = []) {
        await this._ensureConnection();
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve(this.lastID || this.changes);
            });
        });
    }

    async _allQuery(sql, params = []) {
        await this._ensureConnection();
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    async _getQuery(sql, params = []) {
        await this._ensureConnection();
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    // --- MANEJO DE TRANSACCIONES ---

    async beginTransaction() {
        await this._ensureConnection();
        if (this.inTransaction) return;
        await this._runQuery('BEGIN TRANSACTION;');
        this.inTransaction = true;
    }

    async commit() {
        if (!this.inTransaction) throw new Error("No hay transacción activa.");
        await this._runQuery('COMMIT;');
        this.inTransaction = false;
    }

    async rollback() {
        if (!this.inTransaction) return;
        await this._runQuery('ROLLBACK;').catch(() => {});
        this.inTransaction = false;
    }

    // --- FUNCIONES DE UTILIDAD ---

    async listarTablas() {
        const query = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';";
        const rows = await this._allQuery(query);
        return rows.map(row => row.name);
    }

    async vaciarBaseDeDatos() {
        const tablas = await this.listarTablas();
        await this.beginTransaction();
        try {
            for (const tabla of tablas) {
                await this._runQuery(`DELETE FROM ${tabla}`);
                await this._runQuery(`DELETE FROM sqlite_sequence WHERE name='${tabla}'`).catch(() => {});
            }
            await this.commit();
            return true;
        } catch (error) {
            await this.rollback();
            throw error;
        }
    }

    // --- GESTIÓN DE ARCHIVOS .DB ---

    async respaldarArchivoDB(destino) {
        const dir = path.dirname(destino);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        
        await this.desconectar();
        fs.copyFileSync(this.dbPath, destino);
        await this.conectar();
        return { success: true, path: destino };
    }

    async importarArchivoDB(origen) {
        if (!fs.existsSync(origen)) throw new Error("Archivo no encontrado.");
        await this.desconectar();
        fs.copyFileSync(origen, this.dbPath);
        await this.conectar();
        return { success: true };
    }

    // --- IMPORTAR / EXPORTAR JSON ---

    async exportarJSON(filePath) {
        const tablas = await this.listarTablas();
        const data = {};
        for (const t of tablas) data[t] = await this._allQuery(`SELECT * FROM ${t}`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return { success: true };
    }

    async importarJSON(filePath) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        await this.beginTransaction();
        try {
            for (const tabla in data) {
                if (data[tabla].length === 0) continue;
                const cols = Object.keys(data[tabla][0]).join(', ');
                const placeholders = Object.keys(data[tabla][0]).map(() => '?').join(', ');
                const sql = `INSERT OR REPLACE INTO ${tabla} (${cols}) VALUES (${placeholders})`;
                for (const fila of data[tabla]) await this._runQuery(sql, Object.values(fila));
            }
            await this.commit();
            return { success: true };
        } catch (e) { await this.rollback(); throw e; }
    }

     // --- EXPORTAR E IMPORTAR EXCEL (.xlsx / .xls) ---

    /**
     * Exporta TODA la base de datos a un solo archivo Excel.
     * Cada tabla de la BD se convierte en una pestaña (Sheet) diferente.
     */
    async exportarTodoAExcel(destPath) {
        const tablas = await this.listarTablas();
        const wb = XLSX.utils.book_new();

        for (const tabla of tablas) {
            const rows = await this._allQuery(`SELECT * FROM ${tabla}`);
            if (rows.length > 0) {
                const ws = XLSX.utils.json_to_sheet(rows);
                XLSX.utils.book_append_sheet(wb, ws, tabla);
            }
        }

        XLSX.writeFile(wb, destPath);
        return { success: true, path: destPath };
    }

    // --- IMPORTAR / EXPORTAR CSV ---
    /**
     * Exporta una tabla específica a un archivo Excel.
     */
    async exportarTablaAExcel(tabla, destPath) {
        const rows = await this._allQuery(`SELECT * FROM ${tabla}`);
        if (rows.length === 0) throw new Error(`La tabla ${tabla} está vacía o no existe.`);

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, tabla);

        XLSX.writeFile(wb, destPath);
        return { success: true, path: destPath };
    }

    /**
     * Importa datos desde un Excel a la BD.
     * Cada pestaña del Excel debe coincidir con el nombre de una tabla en la BD.
     */
 async importarTodoDesdeExcel(filePath) {
    if (!fs.existsSync(filePath)) throw new Error("Archivo no encontrado.");
    
    const workbook = XLSX.readFile(filePath);
    await this.beginTransaction();

    try {
        for (const sheetName of workbook.SheetNames) {
            // raw: false ayuda a que las fechas y números se lean como texto legible
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" }); 
            
            if (rows.length === 0) continue;

            // Obtenemos los nombres de las columnas reales de la tabla en la BD
            const tableInfo = await this._allQuery(`PRAGMA table_info(${sheetName})`);
            const validColumns = tableInfo.map(c => c.name);

            for (const row of rows) {
                // Filtramos la fila del Excel para que solo tenga columnas que existan en la BD
                const cleanRow = {};
                validColumns.forEach(col => {
                    // Si el Excel no tiene la columna, le ponemos un valor por defecto 
                    // para evitar el error de NOT NULL (especialmente en 'Date')
                    cleanRow[col] = row[col] !== undefined && row[col] !== "" ? row[col] : null;
                    
                    // PARCHE ESPECÍFICO: Si la columna es 'Date' y sigue nula, le ponemos la fecha actual
                    if ((col.toLowerCase() === 'date' || col.toLowerCase() === 'fecha') && !cleanRow[col]) {
                        cleanRow[col] = new Date().toISOString().split('T')[0];
                    }
                });

                const cols = Object.keys(cleanRow).join(', ');
                const placeholders = Object.keys(cleanRow).map(() => '?').join(', ');
                const sql = `INSERT OR REPLACE INTO ${sheetName} (${cols}) VALUES (${placeholders})`;

                await this._runQuery(sql, Object.values(cleanRow));
            }
        }
        await this.commit();
        return { success: true };
    } catch (error) {
        await this.rollback();
        console.error("Error detallado en importación:", error);
        throw error;
    }
}

    /* -------------------------------------------
    | MÉTODOS PÚBLICOS SIMPLIFICADOS
    * -------------------------------------------*/
    
    async crearTabla(sql) {
        return this._runQuery(sql);
    }
    
    async crear(sql, params = []) {
        return this._runQuery(sql, params); 
    }

    async leer(sql, params = []) {
        return this._allQuery(sql, params); 
    }

    async buscar(sql, params = []) {
        return this._getQuery(sql, params);
    }

    async buscarTodo(sql, params = []) {
        return this._allQuery(sql, params);
    }

    async actualizar(sql, params = []) {
        return this._runQuery(sql, params); 
    }

    async borrar(sql, params = []) {
        return this._runQuery(sql, params);
    }

    async borrarTablas() {
        const tablas = await this.listarTablas();
        for (const tabla of tablas) {
            await this._runQuery(`DROP TABLE IF EXISTS ${tabla};`);
        }
        return true;
    }

    async existsData(tableName) {
        const sql = `SELECT COUNT(*) AS count FROM ${tableName};`;
        const row = await this._getQuery(sql);
        return row && row.count > 0;
    }

    async cerrar() {
        return this.desconectar();
    }
}

module.exports = SAIADB;