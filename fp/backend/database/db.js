import mysql from 'mysql'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../env/.env') })

const conexion = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
})

conexion.connect((error) => {
    if(error){
        console.log('El error de conexion es: '+error)
        return
    }
    console.log('CONEXION A LA BASE DE DATOS EXITOSA!')  
})

export default conexion