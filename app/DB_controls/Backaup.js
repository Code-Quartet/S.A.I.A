const path = require('path')
const fs = require('fs')
const os_system = require('os')
const csv = require('fast-csv');
const { v4: uuidv4 } = require('uuid');
/*---------------------------------------------------------*/
const SAIADB = require(path.join(__dirname,'../DataBase/SAIA_manager.js'))
const DB = new SAIADB(path.join(__dirname,'../DataBase/SAIA.db'));
/*--------------LINK BASE DE DATOS ------------------------*/

// ... (dentro de tu clase SAIADB)

    /**
     * 1. EXPORTAR: Genera un objeto JSON con toda la data de todas las tablas.
     * Útil para migraciones o ver datos en texto plano.
     */
    async function ExportarJSON(filePath) {
        try {
            const tablas = await this.listarTablas();
            const backupData = {};

            for (const tabla of tablas) {
                backupData[tabla] = await this.buscarTodo(`SELECT * FROM ${tabla}`);
            }

            fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));
            return { success: true, message: `Datos exportados a ${filePath}` };
        } catch (error) {
            throw new Error(`Error al exportar: ${error.message}`);
        }
    }

    /**
     * 2. IMPORTAR: Lee un JSON e inserta los datos en las tablas correspondientes.
     * Nota: Las tablas ya deben existir.
     */
    async function ImportarJSON(filePath) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const tablas = Object.keys(data);

        await DB.beginTransaction();
        try {
            for (const tabla of tablas) {
                const registros = data[tabla];
                if (registros.length === 0) continue;

                const columnas = Object.keys(registros[0]).join(', ');
                const marcadores = Object.keys(registros[0]).map(() => '?').join(', ');
                const sql = `INSERT OR REPLACE INTO ${tabla} (${columnas}) VALUES (${marcadores})`;

                for (const fila of registros) {
                    await DB._runQuery(sql, Object.values(fila));
                }
            }
            await DB.commit();
            return { success: true, message: "Importación completada con éxito." };
        } catch (error) {
            await DB.rollback();
            throw new Error(`Error al importar: ${error.message}`);
        }
    }

    /**
     * 3. VACIAR: Elimina todos los registros de todas las tablas 
     * sin borrar la estructura (las tablas permanecen vacías).
     */
    async function VaciarBaseDeDatos() {
        const tablas = await DB.listarTablas();
        await DB.beginTransaction();
        try {
            for (const tabla of tablas) {
                await DB._runQuery(`DELETE FROM ${tabla}`);
                // Opcional: Reiniciar contadores de autoincremento si los usas
                await DB._runQuery(`DELETE FROM sqlite_sequence WHERE name='${tabla}'`).catch(() => {});
            }
            await DB.commit();
            return { success: true, message: "Todas las tablas han sido vaciadas." };
        } catch (error) {
            await DB.rollback();
            throw error;
        }
    }

    /**
     * 4. RESPALDO (Backup Físico): Copia el archivo .db actual a una nueva ruta.
     * Es la forma más segura de no perder nada.
     */
    async function CrearRespaldoFisico(destPath = null) {
        if (!destPath) {
            const fecha = new Date().toISOString().replace(/[:.]/g, '-');
            destPath = `./backup_SAIA_${fecha}.db`;
        }

        try {
            // Cerramos la conexión momentáneamente para asegurar que el archivo no esté bloqueado
            await DB.desconectar();
            
            fs.copyFileSync(DB.dbPath,destPath);
            
            // Volvemos a conectar
            await DB.conectar();
            return { success: true, path: destPath };
        } catch (error) {
            throw new Error(`Error al crear respaldo físico: ${error.message}`);
        }
    }


    async function RespaldarArchivoDB(destinationPath) {
        try {
            // 1. Aseguramos que el directorio de destino exista
            const dir = path.dirname(destinationPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // 2. Cerramos la conexión actual para liberar el archivo y evitar corrupción
            await DB.desconectar();

            // 3. Copiamos el archivo físicamente
            fs.copyFileSync(DB.dbPath, destinationPath);

            // 4. Reconectamos para que el objeto siga siendo funcional
            await DB.conectar();

            return { success: true, message: `Respaldo creado en: ${destinationPath}` };
        } catch (error) {
            // Intentamos reconectar incluso si falla la copia
            await DB.conectar();
            throw new Error(`Error al respaldar el archivo .db: ${error.message}`);
        }
    }

    async function ImportarArchivoDB(sourcePath) {
        try {
            // 1. Validamos que el archivo de origen exista
            if (!fs.existsSync(sourcePath)) {
                throw new Error("El archivo de origen no existe.");
            }

            // 2. Cerramos la conexión actual obligatoriamente
            await DB.desconectar();

            // 3. Reemplazamos el archivo actual con el de origen
            fs.copyFileSync(sourcePath, DB.dbPath);

            // 4. Abrimos la conexión con la nueva base de datos
            await DB.conectar();

            return { success: true, message: "Base de datos restaurada correctamente." };
        } catch (error) {
            // Intentamos recuperar la conexión pase lo que pase
            await DB.conectar();
            throw new Error(`Error al importar el archivo .db: ${error.message}`);
        }
    }

    async function mantenimiento() {
        // Crear una copia de seguridad rápida
        await DB.crearRespaldoFisico('./backups/seguridad.db');

        // Exportar a JSON para reporte
        await DB.exportarJSON('./datos_actuales.json');

        // Limpiar todo para iniciar de cero
        // await DB.vaciarBaseDeDatos();
    }
/*-----------------------------------------------------*/

// ... dentro de tu clase SAIADB

    /**
     * EXPORTAR A EXCEL (CSV)
     * Exporta una tabla específica a un archivo .csv compatible con Excel.
     * @param {string} tableName - Nombre de la tabla (ej: 'Student')
     * @param {string} filePath - Ruta donde se guardará (ej: './estudiantes.csv')
     */
    async function ExportarAExcel(tableName, filePath) {
        try {
            const rows = await DB.buscarTodo(`SELECT * FROM ${tableName}`);
            
            if (rows.length === 0) {
                throw new Error(`La tabla ${tableName} está vacía.`);
            }

            const ws = fs.createWriteStream(filePath);
            
            // Usamos fast-csv para escribir el archivo
            csv.write(rows, { headers: true })
                .pipe(ws)
                .on('finish', () => console.log(`Exportación de ${tableName} completada.`));

            return { success: true, message: `Archivo creado en ${filePath}` };
        } catch (error) {
            throw new Error(`Error al exportar a Excel: ${error.message}`);
        }
    }

    /**
     * IMPORTAR DESDE EXCEL (CSV)
     * Lee un archivo .csv e inserta los datos en la tabla.
     * @param {string} tableName - Tabla de destino
     * @param {string} filePath - Ruta del archivo .csv
     */
    async function ImportarDesdeExcel(tableName, filePath) {
        if (!fs.existsSync(filePath)) throw new Error("El archivo CSV no existe.");

        const rows = [];
        
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv.parse({ headers: true })) // Lee la primera fila como nombres de columna
                .on('data', (row) => rows.push(row))
                .on('end', async () => {
                    try {
                        await DB.beginTransaction();
                        
                        for (const row of rows) {
                            const columnas = Object.keys(row).join(', ');
                            const marcadores = Object.keys(row).map(() => '?').join(', ');
                            const valores = Object.values(row);
                            
                            const sql = `INSERT OR REPLACE INTO ${tableName} (${columnas}) VALUES (${marcadores})`;
                            await DB._runQuery(sql, valores);
                        }
                        
                        await DB.commit();
                        resolve({ success: true, count: rows.length });
                    } catch (err) {
                        await DB.rollback();
                        reject(err);
                    }
                })
                .on('error', (error) => reject(error));
        });
    }
/*-----------------------------------------------------*/
async function ExportarTodoAExcel(folderPath = './backup_excel') {
        try {
            // 1. Crear carpeta si no existe
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }

            const tablas = await DB.listarTablas();
            const promesas = tablas.map(tabla => {
                return new Promise(async (resolve, reject) => {
                    const rows = await DB.buscarTodo(`SELECT * FROM ${tabla}`);
                    if (rows.length === 0) return resolve(); // Saltar tablas vacías

                    const filePath = path.join(folderPath, `${tabla}.csv`);
                    const ws = fs.createWriteStream(filePath);

                    csv.write(rows, { headers: true })
                        .pipe(ws)
                        .on('finish', () => resolve())
                        .on('error', (err) => reject(err));
                });
            });

            await Promise.all(promesas);
            return { success: true, message: `Se exportaron ${tablas.length} tablas a ${folderPath}` };
        } catch (error) {
            throw new Error(`Error en exportación masiva: ${error.message}`);
        }
    }

    /**
     * IMPORTAR TODO DESDE EXCEL
     * Busca archivos .csv en una carpeta que coincidan con los nombres de las tablas e importa su contenido.
     * @param {string} folderPath - Carpeta donde están los archivos .csv
     */
    async function ImportarTodoDesdeExcel(folderPath = './backup_excel') {
        if (!fs.existsSync(folderPath)) throw new Error("La carpeta de origen no existe.");

        try {
            const archivos = fs.readdirSync(folderPath).filter(f => f.endsWith('.csv'));
            
            for (const archivo of archivos) {
                const nombreTabla = path.parse(archivo).name; // Quita el .csv
                const filePath = path.join(folderPath, archivo);
                
                // Reutilizamos la lógica de importación individual por cada archivo encontrado
                await importarArchivoIndividual(nombreTabla, filePath);
                console.log(`✓ Tabla [${nombreTabla}] importada con éxito.`);
            }

            return { success: true, message: "Importación masiva completada." };
        } catch (error) {
            throw new Error(`Error en importación masiva: ${error.message}`);
        }
    }


    /**
     * Método privado de apoyo para procesar el flujo de lectura de CSV
     */
    function importarArchivoIndividual(tableName, filePath) {
        return new Promise((resolve, reject) => {
            const rows = [];
            fs.createReadStream(filePath)
                .pipe(csv.parse({ headers: true }))
                .on('data', (row) => rows.push(row))
                .on('end', async () => {
                    try {
                        await DB.beginTransaction();
                        for (const row of rows) {
                            const columnas = Object.keys(row).join(', ');
                            const marcadores = Object.keys(row).map(() => '?').join(', ');
                            const sql = `INSERT OR REPLACE INTO ${tableName} (${columnas}) VALUES (${marcadores})`;
                            await DB._runQuery(sql, Object.values(row));
                        }
                        await DB.commit();
                        resolve();
                    } catch (err) {
                        await DB.rollback();
                        reject(err);
                    }
                })
                .on('error', reject);
        });
    }

    
/*------------------------------------------------------*/
module.exports={
    ExportarJSON:ExportarJSON,
    ImportarJSON:ImportarJSON,
    CrearRespaldoFisico:CrearRespaldoFisico,
    ImportarArchivoDB:ImportarArchivoDB,
    RespaldarArchivoDB:RespaldarArchivoDB,
    ImportarDesdeExcel:ImportarDesdeExcel,
    ExportarAExcel:ExportarAExcel,
    ImportarTodoDesdeExcel:ImportarTodoDesdeExcel,
    ExportarTodoAExcel:ExportarTodoAExcel,
    VaciarBaseDeDatos:VaciarBaseDeDatos
}