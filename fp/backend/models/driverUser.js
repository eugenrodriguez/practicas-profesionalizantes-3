// backend/models/driverUser.js
import User from './User.js';
import { query } from '../config/db.js';

class DriverUser extends User {
    constructor(name, email, password, licencia, patente, vehiculo) {
        super(name, email, password, 'conductor');
        this.licencia = licencia;
        this.patente = patente;
        this.vehiculo = vehiculo;
    }

    async register() {
        const userId = await this.insertUser();
        try {
            await query(
                'INSERT INTO conductores (id, licencia, patente, vehiculo) VALUES (?, ?, ?, ?)',
                [userId, this.licencia, this.patente, this.vehiculo]
            );
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                if (err.sqlMessage.includes('licencia')) err.code = 'DUP_LICENCIA';
                else if (err.sqlMessage.includes('patente')) err.code = 'DUP_PATENTE';
            }
            throw err;
        }
    }
}

export default DriverUser;
