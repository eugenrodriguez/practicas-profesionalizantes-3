import { db } from '../config/db.js';
import bcrypt from 'bcryptjs';

class UserProfile {
    async getProfileData(userId) {
        const userQuery = `
            SELECT u.id, u.name, u.email, u.password, GROUP_CONCAT(r.name) as roles
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            WHERE u.id = ?
            GROUP BY u.id
        `;
        const userData = await db.query(userQuery, [userId]);
        let user = userData[0];

        if (!user) return null;

        user.roles = user.roles ? user.roles.split(',') : [];

        if (user.roles.includes('conductor')) {
            const conductorData = await db.query('SELECT licencia, patente, vehiculo FROM conductores WHERE id = ?', [userId]);
            if (conductorData.length > 0) {
                Object.assign(user, conductorData[0]);
            }
        }

        if (user.roles.includes('pasajero')) {
            const pasajeroData = await db.query('SELECT telefono, direccion FROM pasajeros WHERE id = ?', [userId]);
            if (pasajeroData.length > 0) {
                Object.assign(user, pasajeroData[0]);
            }
        }
        
        const { password, ...profile } = user;
        return profile;
    }

    async update(userId, data) {
        const { name, currentPassword, newPassword, vehiculo, patente, roles } = data;

        if (newPassword) {
            const fullUserData = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
            if (fullUserData.length === 0) throw new Error('User not found'); 
            
            const storedHash = fullUserData[0].password;
            const isValid = await bcrypt.compare(currentPassword, storedHash);
            
            if (!isValid) {
                const err = new Error('Contraseña actual incorrecta');
                err.code = 'INVALID_PASSWORD';
                throw err;
            }

            const hashedPassword = await bcrypt.hash(newPassword, 8);
            await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
        }

        if (name) {
            await db.query('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
        }

        if (roles && roles.includes('conductor')) {
            const updates = [];
            const values = [];

            if (vehiculo !== undefined) {
                updates.push('vehiculo = ?');
                values.push(vehiculo);
            }
            if (patente !== undefined) {
                updates.push('patente = ?');
                values.push(patente);
            }

            if (updates.length > 0) {
                values.push(userId);
                await db.query(`UPDATE conductores SET ${updates.join(', ')} WHERE id = ?`, values);
            }
        }

        return true;
    }
}

export default new UserProfile();