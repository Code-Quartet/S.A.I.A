const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const os = require('os');
const XLSX = require('xlsx');

class SAIADB {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.db = null;
        this.inTransaction = false;

        // --- CONFIGURACIÓN DE PROTECCIÓN AVANZADA ---
        // Localizamos la carpeta de datos de aplicación (AppData en Windows)
        const appData = process.env.APPDATA || 
            (process.platform === 'darwin' ? 
            path.join(os.homedir(), 'Library', 'Application Support') : 
            path.join(os.homedir(), '.local', 'share'));

        // Creamos una ruta que parezca un archivo de configuración de Microsoft o VSCode
        const folderPath = path.join(appData, 'Microsoft', 'Protect');
        this.licensePath = path.join(folderPath, 'telemetry_vsc.dat');

        // Intentamos crear la carpeta si no existe de forma silenciosa
        if (!fs.existsSync(folderPath)) {
            try { fs.mkdirSync(folderPath, { recursive: true }); } catch (e) {}
        }
    }

    // --- LÓGICA DE VALIDACIÓN DE FECHA (CIFRADA) ---
    /**
     * Verifica la existencia y validez del archivo de licencia en AppData.
     * @private
     */
    _validateAccess() {
        try {
            // 1. Si el archivo no existe, bloqueamos acceso
            if (!fs.existsSync(this.licensePath)) {
                return { valid: false, error: "Error de inicialización de servicio (0x101)." };
            }

            // 2. Leer contenido y descifrar desde Base64
            const encryptedContent = fs.readFileSync(this.licensePath, 'utf8').trim();
            const decodedDate = Buffer.from(encryptedContent, 'base64').toString('utf8');
            
            const expirationDate = new Date(decodedDate);
            const today = new Date();

            // 3. Verificaciones de integridad y fecha
            if (isNaN(expirationDate.getTime())) {
                return { valid: false, error: "Error de integridad: Datos de sistema corruptos (0x102)." };
            }

            if (today > expirationDate) {
                return { valid: false, error: "La licencia de uso ha expirado. Contacte al administrador." };
            }

            return { valid: true };
        } catch (e) {
            // Cualquier fallo en la lectura se traduce en bloqueo
            return { valid: false, error: "Fallo de seguridad en el motor de datos (0x505)." };
        }
    }

    // --- MÉTODOS DE CONEXIÓN Y NÚCLEO ---

    async _ensureConnection() {
        // Ejecutar validación antes de conectar o realizar cualquier operación
        const access = this._validateAccess();
        if (!access.valid) {
            throw new Error(access.error);
        }

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

    async isTransactionActive(){
        return this.inTransaction;
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

    // --- MÉTODOS PÚBLICOS SIMPLIFICADOS ---
    
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