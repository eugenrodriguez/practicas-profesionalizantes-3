//backend/config/db.js:
import mysql from 'mysql';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../env/.env') });

export class Database {
    constructor() {
        this.connection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_DATABASE
        });

        this.connection.connect(err => {
            if (err) console.log('Error de conexión:', err);
            else console.log('CONEXIÓN A LA BASE DE DATOS EXITOSA!');
        });
    }

    query(sql, values = []) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, values, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    }
}

export const db = new Database();