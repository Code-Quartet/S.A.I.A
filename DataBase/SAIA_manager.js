const sqlite3 = require('sqlite3').verbose();
const path = require('path')
const fs = require('fs')


class SAIADB{

        constructor(dbPath = './SAIA.db') {
            this.dbPath = dbPath;
            this.db = null;
            this.inTransaction = false;
        }

        // Método Privado: Garantiza que la conexión esté abierta
        async _ensureConnection() {
            if (this.db) {
                // Ya conectado, devolvemos inmediatamente
                return true;
            }

            // Si no está conectado, llamamos a this.conectar()
            await this.conectar();
            
            if (!this.db) {
                throw new Error("Fallo en el intento de conectar a la base de datos.");
            }
            return true;
        }

        /**
         * Conectar a la base de datos (crea el archivo si no existe).
         * @returns {Promise<boolean>} Resuelve a true si la conexión fue exitosa.
         */
        conectar() {
            return new Promise((resolve, reject) => {
                // Evitamos intentar conectar si ya estamos en una transacción o conectados
                if (this.db) {
                    return resolve(true); 
                }
                
                this.db = new sqlite3.Database(this.dbPath, (err) => {
                    if (err) {
                        this.db = null; // Si falla, aseguramos que db es null
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
            });
        }

        async desconectar() {
          
            return this.cerrar();
        }
        
        // -------------------------------------------
        // MÉTODOS DE TRANSACCIONES (Requieren conexión)
        // -------------------------------------------

        async beginTransaction() {
            await this._ensureConnection(); // **Garantizamos conexión**
            return new Promise((resolve, reject) => {
                if (this.inTransaction) {
                    return resolve(); 
                }
                this.db.run('BEGIN TRANSACTION;', (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        this.inTransaction = true;
                        resolve();
                    }
                });
            });
        }
        
        async commit() {
            if (!this.inTransaction) {
                 // Opcional: Podríamos llamar a _ensureConnection() aquí si el error de commit
                 // fuera un problema de conexión, pero el error lógico es la transacción ausente.
                 return Promise.reject(new Error("No hay transacción activa para confirmar."));
            }
            return new Promise((resolve, reject) => {
                // No necesitamos await _ensureConnection() aquí porque commit solo se llama 
                // después de beginTransaction, lo que garantiza la conexión.
                this.db.run('COMMIT;', (err) => {
                    this.inTransaction = false;
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }
        
        async rollback() {
            if (!this.inTransaction) {
                return Promise.resolve();
            }
            return new Promise((resolve, reject) => {
                this.db.run('ROLLBACK;', (err) => {
                    this.inTransaction = false;
                    if (err) {
                        //console.error("Error durante el ROLLBACK:", err);
                        resolve(); // Preferimos resolver para terminar el flujo
                    } else {
                        resolve();
                    }
                });
            });
        }

        // ... (isTransactionActive se mantiene igual)
        isTransactionActive(){

            return this.inTransaction;

        }
        // -------------------------------------------
        // MÉTODOS DE LECTURA/ESCRITURA CON GARANTÍA DE CONEXIÓN
        // -------------------------------------------

        // Usado internamente para CREATE/UPDATE/DELETE
        async _runQuery(sql, params = []) {
            await this._ensureConnection(); // **Garantizamos conexión**
            return new Promise((resolve, reject) => {
                this.db.run(sql, params, function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID || this.changes); 
                });
            });
        }
        
        // Usado internamente para buscar 1 registro
        async _getQuery(sql, params = []) {
            await this._ensureConnection(); // **Garantizamos conexión**
            return new Promise((resolve, reject) => {
                this.db.get(sql, params, (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
        }
        
        // Usado internamente para buscar TODOS los registros
        async _allQuery(sql, params = []) {
            await this._ensureConnection(); // **Garantizamos conexión**
            return new Promise((resolve, reject) => {
                this.db.all(sql, params, (err, rows) => {
                    // Aquí es donde ocurría el error: this.db.all(...)
                    // Ahora, _ensureConnection() garantiza que this.db no es null.
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
        }

        /* -------------------------------------------
        | MÉTODOS PÚBLICOS SIMPLIFICADOS
        * -------------------------------------------*/
        // Crear tabla
        async crearTabla(sql){

            return this._runQuery(sql);
        
        }
        
        // Insertar (CREATE)
        async crear(sql, params = []) {
         
            return this._runQuery(sql, params); 
        }

        // Leer (Buscar varios registros)
        async leer(sql, params = []) {
        
            return this._allQuery(sql, params); 
        }

        // Buscar un solo registro (READ)
        async buscar(sql, params = []) {
            
            return this._getQuery(sql, params);
        }

        // Buscar todos los registros (READ)
        async buscarTodo(sql, params = []) {
            // Este es el método que causaba el problema, ahora usa la función garantizada.
            return this._allQuery(sql, params);
        }

        // Actualizar registros (UPDATE)
        async actualizar(sql, params = []) {
          
            return this._runQuery(sql, params); 
        }

        // Borrar registros (DELETE)
        async borrar(sql, params = []) {
          
            return this._runQuery(sql, params);
        }

        async borrarTablas(){

            return new Promise((resolve, reject) => {

                this.listarTablas()
                    .then(tablas => {
                        if (tablas.length === 0) return resolve();
                        let pendientes = tablas.length;
                        tablas.forEach(tabla => {
                            this.db.run(`DROP TABLE ${tabla};`, [], (err) => {
                                if (err) reject(err);
                                pendientes--;
                                if (pendientes === 0) resolve();
                            });
                        });
                    })
                    .catch(reject);
           });
        }

    async existsData(tableName) {
            // Garantizar la conexión antes de la consulta
            await this._ensureConnection(); 

            const sql = `SELECT COUNT(*) AS count FROM ${tableName};`;
            
            return new Promise((resolve, reject) => {
                // Usamos .get() porque solo esperamos una fila (el conteo)
                this.db.get(sql, [], (err, row) => {
                    if (err) {
                        // Si hay un error (ej: la tabla no existe), rechazamos la Promesa
                        reject(err);
                    } else {
                        // Si el conteo (row.count) es mayor que 0, devolvemos true.
                        // SQLite devuelve el conteo como un número.
                        const exists = row.count > 0;
                        resolve(exists);
                    }
                });
            });
    }


    // Listar todas las tablas
    async listarTablas() {
            const query = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';";
            return this._allQuery(query).then(rows => rows.map(row => row.name));
    }

        // Cerrar la conexión (Se mantiene igual, pero es importante que this.db = null)
    cerrar() {
            return new Promise((resolve, reject) => {
                if (!this.db) return resolve(true);

                this.db.close((err) => {
                    if (err) reject(err);
                    else {
                        this.db = null;
                        this.inTransaction = false; 
                        resolve(true);
                    }
                });
            });
    }
        
        // ... (El resto de los métodos se pueden adaptar para usar _runQuery o _allQuery)

}

module.exports = SAIADB;
/*******************************************/
/****

db.verificarOCrearDB(async (dbInstance) => {
    // Crear tabla si la base de datos es nueva
    await dbInstance.crearTabla(`CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        cantidad INTEGER
    )`);
    console.log('Tabla productos creada.');
}).then((existe) => {
    if (existe) {
        console.log('La base de datos ya existía.');
    } else {
        console.log('La base de datos fue creada y se inicializó.');
    }
});


db.verificarOCrearDB().then(() => {
    db.limpiarTablas()
      .then(() => console.log('¡Todas las tablas han sido vaciadas!'))
      .catch(err => console.error('Error al limpiar tablas:', err));
});

INSERT INTO productos (cod,cod.E,Nombre,precio,iva,descuento,image,categoria,cant,informacion_adicional ) VALUES ('LPT-001A', '9998877665544', 'Monitor 4K Curvo', 399.99, 12.50, 10.00, '/img/monitor_4k.png', 'Periféricos', 25, 'Pantalla de 32 pulgadas, 144Hz de tasa de refresco.')



*****/
