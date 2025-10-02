// backend/models/passengerUser.js
import User from './User.js';
import { query } from '../config/db.js';

class PassengerUser extends User {
    constructor(name, email, password, telefono, direccion) {
        super(name, email, password, 'pasajero');
        this.telefono = telefono;
        this.direccion = direccion;
    }

    async register() {
        const userId = await this.insertUser();
        try {
            await query(
                'INSERT INTO pasajeros (id, telefono, direccion) VALUES (?, ?, ?)',
                [userId, this.telefono, this.direccion]
            );
        } catch (err) {
            throw err;
        }
    }
}

export default PassengerUser;
