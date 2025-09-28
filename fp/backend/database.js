import mysql from 'mysql'
import dotenv from 'dotenv'

dotenv.config({path: './env/.env'})

const db = mysql.createConnection({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
})

db.connect((error) => {
    if (error) {
        console.error("Error de conexión:", error)
        return
    }
    console.log("✅ Conexión con la base de datos exitosa")
})

export default db
