import User from './User.js';
import { db } from '../config/db.js';

class DriverUser extends User {
    constructor(name, email, password, licencia, patente, vehiculo, existingRoles = []) {
        const roles = [...existingRoles, 'conductor'];
        super(name, email, password, roles);
        this.licencia = licencia;
        this.patente = patente;
        this.vehiculo = vehiculo;
    }

    async register(userId = null) {
        if (!userId) {
            userId = await this.insertUser();
        }
        
        await this.assignRoles(userId);
        
        try {
            await db.query(
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
        
        return userId;
    }
}

export default DriverUser;