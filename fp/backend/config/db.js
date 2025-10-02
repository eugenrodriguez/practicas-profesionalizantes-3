import mysql from 'mysql';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, '../env/.env') });

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
});

connection.connect(function(error) {
    if (error) {
        console.log('Error de conexión: ' + error);
        return;
    }
    console.log('CONEXIÓN A LA BASE DE DATOS EXITOSA!');
});

export function query(sql, values) {
    return new Promise(function(resolve, reject) {
        connection.query(sql, values, function(err, result) {
            if (err) return reject(err);
            resolve(result);
        });
    });
}
