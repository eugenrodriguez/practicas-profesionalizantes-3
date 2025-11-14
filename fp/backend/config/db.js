import mysql from 'mysql';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../env/.env') });

export class Database {
    constructor() {
        this.pool = mysql.createPool({
            connectionLimit: 10, 
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_DATABASE
        });

        this.pool.getConnection((err, connection) => {
            if (err) console.log('Error al obtener conexión del pool:', err);
            if (connection) {
                console.log('CONEXIÓN A LA BASE DE DATOS EXITOSA!');
                connection.release(); 
            }
        });
    }

    query(sql, values = []) {
        return new Promise((resolve, reject) => {
            this.pool.query(sql, values, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    }
}

export const db = new Database();