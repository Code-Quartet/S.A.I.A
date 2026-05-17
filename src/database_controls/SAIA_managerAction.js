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

            // ... (isTransactionActive se mantiene igual)
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