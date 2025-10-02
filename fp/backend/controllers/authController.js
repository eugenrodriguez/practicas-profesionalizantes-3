import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import DriverUser from '../models/driverUser.js';
import PassengerUser from '../models/passengerUser.js';

/**
 * Establece la cookie JWT HTTP-only
 * @param {Object} res Respuesta de Express
 * @param {string} token JWT generado
 */
function setJWTCookie(res, token) {
    const cookieOptions = {
        expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000)),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };
    res.cookie('jwt', token, cookieOptions);
}

// =========================================================
// Funciones de Autenticación Principal
// =========================================================

export async function login(req, res) {
    try {
        const email = req.body.email;
        const password = req.body.password;

        if (!email || !password) {
            return res.status(400).json({ error: 'Debe ingresar email y contraseña' });
        }

        const user = await User.findUserByEmail(email);

        if (!user || !(await User.comparePassword(password, user.password))) {
            return res.status(401).json({ error: 'Email o contraseña incorrectos' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
        );

        setJWTCookie(res, token);

        return res.status(200).json({
            message: 'Inicio de sesión exitoso',
            user: { id: user.id, name: user.name, role: user.role }
        });
    } catch (error) {
        console.error("Error en el login:", error);
        return res.status(500).json({ error: 'Error interno del servidor durante el login' });
    }
}

export function logout(req, res) {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    return res.status(200).json({ message: 'Sesión cerrada exitosamente' });
}

// =========================================================
// Funciones de Registro
// =========================================================

export async function driverRegister(req, res) {
    try {
        const { name, email, password, licencia, patente, vehiculo } = req.body;
        const driver = new DriverUser(name, email, password, licencia, patente, vehiculo);
        await driver.register();

        return res.status(201).json({
            message: 'Registro de conductor exitoso',
            user: { name: driver.name, email: driver.email, role: driver.role }
        });
    } catch (error) {
        switch (error.code) {
            case 'DUP_EMAIL':
                return res.status(400).json({ error: 'El email ya está registrado' });
            case 'DUP_LICENCIA':
                return res.status(400).json({ error: 'La licencia ya está registrada' });
            case 'DUP_PATENTE':
                return res.status(400).json({ error: 'La patente ya está registrada' });
            default:
                console.error("Error al registrar conductor:", error);
                return res.status(500).json({ error: 'Error interno del servidor al registrar conductor' });
        }
    }
}

export async function passengerRegister(req, res) {
    try {
        const { name, email, password, telefono, direccion } = req.body;
        const passenger = new PassengerUser(name, email, password, telefono, direccion);
        await passenger.register();

        return res.status(201).json({
            message: 'Registro de pasajero exitoso',
            user: { name: passenger.name, email: passenger.email, role: passenger.role }
        });
    } catch (error) {
        switch (error.code) {
            case 'DUP_EMAIL':
                return res.status(400).json({ error: 'El email ya está registrado' });
            default:
                console.error("Error al registrar pasajero:", error);
                return res.status(500).json({ error: 'Error interno del servidor al registrar pasajero' });
        }
    }
}

export function checkStatus(req, res) {
    return res.status(200).json({ isAuthenticated: true, user: req.user });
}
