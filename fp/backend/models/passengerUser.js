//backend/models/passengerUser.js:
import User from './User.js';
import { db } from '../config/db.js';

class PassengerUser extends User {
    constructor(name, email, password, telefono, direccion, existingRoles = []) {
        const roles = [...existingRoles, 'pasajero'];
        super(name, email, password, roles);
        this.telefono = telefono;
        this.direccion = direccion;
    }

    async register(userId = null) {
        if (!userId) {
            userId = await this.insertUser();
        }
        
        await this.assignRoles(userId);
        
        try {
            await db.query(
                'INSERT INTO pasajeros (id, telefono, direccion) VALUES (?, ?, ?)',
                [userId, this.telefono, this.direccion]
            );
        } catch (err) {
            throw err;
        }
        
        return userId;
    }
}

export default PassengerUser;