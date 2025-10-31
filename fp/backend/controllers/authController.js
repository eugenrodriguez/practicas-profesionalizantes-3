//backend/controllers/authController.js:
import User from '../models/User.js';
import DriverUser from '../models/driverUser.js';
import PassengerUser from '../models/passengerUser.js';
import { SessionService } from '../services/SessionService.js';

const sessionService = new SessionService();

export async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Debe ingresar email y contraseña' });
        }

        const user = await User.findUserByEmail(email);
        if (!user || !(await User.comparePassword(password, user.password))) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }

        const token = sessionService.createToken(user);
        sessionService.setJWTCookie(res, token);

        return res.status(200).json({
            message: 'Inicio de sesión exitoso',
            user: { 
                id: user.id, 
                name: user.name, 
                roles: user.roles 
            }
        });
    } catch (error) {
        console.error("Error en login:", error);
        return res.status(500).json({ error: 'Error interno del servidor durante el login' });
    }
}

export function logout(req, res) {
    sessionService.clearJWTCookie(res);
    return res.status(200).json({ message: 'Sesión cerrada exitosamente' });
}

export async function driverRegister(req, res) {
    try {
        const { name, email, password, licencia, patente, vehiculo } = req.body;
        
        const existingUser = await User.findUserByEmail(email);
        
        if (existingUser) {
            if (existingUser.roles.includes('conductor')) {
                return res.status(400).json({ error: 'Ya estás registrado como conductor' });
            }
            
            const driver = new DriverUser(
                existingUser.name, 
                existingUser.email, 
                password, 
                licencia, 
                patente, 
                vehiculo,
                existingUser.roles
            );
            await driver.register(existingUser.id);
            return _loginUser(res, existingUser, 'conductor', 'Rol de conductor agregado exitosamente'); // REFACTOR
        }
        
        const driver = new DriverUser(name, email, password, licencia, patente, vehiculo);
        await driver.register();

        const newUser = await User.findUserByEmail(email);
        return _loginUser(res, newUser, null, 'Registro de conductor exitoso'); // REFACTOR
    } catch (error) {
        if (error.code === 'DUP_EMAIL') {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }
        console.error("Error al registrar pasajero:", error);
        return res.status(500).json({ error: 'Error interno del servidor al registrar pasajero' });
    }
}

function _loginUser(res, user, newRole = null, message) {
        const finalRoles = newRole ? [...user.roles, newRole] : user.roles;
        const userForToken = { ...user, roles: finalRoles };

        const token = sessionService.createToken(userForToken);
        sessionService.setJWTCookie(res, token);

        return res.status(201).json({
            message,
            user: { id: user.id, name: user.name, email: user.email, roles: finalRoles }
        });
    }

export async function passengerRegister(req, res) {
    try {
        const { name, email, password, telefono, direccion } = req.body;
        
        const existingUser = await User.findUserByEmail(email);
        
        if (existingUser) {
            if (existingUser.roles.includes('pasajero')) {
                return res.status(400).json({ error: 'Ya estás registrado como pasajero' });
            }
            
            const passenger = new PassengerUser(existingUser.name, existingUser.email, password, telefono, direccion, existingUser.roles);
            await passenger.register(existingUser.id);
            return _loginUser(res, existingUser, 'pasajero', 'Rol de pasajero agregado exitosamente');
        }
        
        const passenger = new PassengerUser(name, email, password, telefono, direccion);
        await passenger.register();

        const newUser = await User.findUserByEmail(email);
        return _loginUser(res, newUser, null, 'Registro de pasajero exitoso');
    } catch (error) {
        if (error.code === 'DUP_EMAIL') {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }
        console.error("Error al registrar conductor:", error);
        return res.status(500).json({ error: 'Error interno del servidor al registrar conductor' });
    }
}

export function checkStatus(req, res) {
    return res.status(200).json({ isAuthenticated: true, user: req.user });
}
