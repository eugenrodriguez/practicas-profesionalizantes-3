// backend/models/User.js
import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';

class User {
    constructor(name, email, password, role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 8);
    }

    async insertUser() {
        await this.hashPassword();
        try {
            const result = await query(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [this.name, this.email, this.password, this.role]
            );
            return result.insertId;
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage.includes('email')) {
                err.code = 'DUP_EMAIL';
            }
            throw err;
        }
    }

    static async findUserByEmail(email) {
        const results = await query(
            'SELECT id, name, email, password, role FROM users WHERE email = ?',
            [email]
        );
        return results[0] || null;
    }

    static async comparePassword(providedPassword, hashedPassword) {
        return bcrypt.compare(providedPassword, hashedPassword);
    }
}

export default User;
