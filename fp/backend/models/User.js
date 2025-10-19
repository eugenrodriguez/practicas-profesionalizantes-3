import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';

class User {
    constructor(name, email, password, roles = []) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.roles = Array.isArray(roles) ? roles : [roles];
    }

    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 8);
    }

    async insertUser() {
        await this.hashPassword();
        try {
            const result = await db.query(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                [this.name, this.email, this.password]
            );
            return result.insertId;
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY' && err.sqlMessage.includes('email')) {
                err.code = 'DUP_EMAIL';
            }
            throw err;
        }
    }

    async assignRoles(userId) {
        for (const roleName of this.roles) {
            const roleResult = await db.query(
                'SELECT id FROM roles WHERE name = ?',
                [roleName]
            );
            
            if (roleResult.length === 0) {
                throw new Error(`Rol ${roleName} no existe`);
            }

            const roleId = roleResult[0].id;
            
            await db.query(
                'INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)',
                [userId, roleId]
            );
        }
    }

    static async findUserByEmail(email) {
        const results = await db.query(
            `SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.password,
                GROUP_CONCAT(r.name) as roles
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            WHERE u.email = ?
            GROUP BY u.id`,
            [email]
        );
        
        if (results.length === 0) return null;
        
        const user = results[0];
        user.roles = user.roles ? user.roles.split(',') : [];
        return user;
    }

    static async findUserById(id) {
        const results = await db.query(
            `SELECT 
                u.id, 
                u.name, 
                u.email,
                GROUP_CONCAT(r.name) as roles
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            WHERE u.id = ?
            GROUP BY u.id`,
            [id]
        );
        
        if (results.length === 0) return null;
        
        const user = results[0];
        user.roles = user.roles ? user.roles.split(',') : [];
        return user;
    }

    static async hasRole(userId, roleName) {
        const results = await db.query(
            `SELECT COUNT(*) as count
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = ? AND r.name = ?`,
            [userId, roleName]
        );
        return results[0].count > 0;
    }

    static async comparePassword(providedPassword, hashedPassword) {
        return bcrypt.compare(providedPassword, hashedPassword);
    }
}

export default User;