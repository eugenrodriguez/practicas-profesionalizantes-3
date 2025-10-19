import User from '../models/User.js';
import DriverUser from '../models/driverUser.js';
import PassengerUser from '../models/passengerUser.js';
import { SessionService } from '../services/SessionService.js';

export class AuthController {
    constructor() {
        this.sessionService = new SessionService();
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Debe ingresar email y contraseña' });
            }

            const user = await User.findUserByEmail(email);
            if (!user || !(await User.comparePassword(password, user.password))) {
                return res.status(401).json({ error: 'Email o contraseña incorrectos' });
            }

            const token = this.sessionService.createToken(user);
            this.sessionService.setJWTCookie(res, token);

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

    logout(req, res) {
        this.sessionService.clearJWTCookie(res);
        return res.status(200).json({ message: 'Sesión cerrada exitosamente' });
    }

    async driverRegister(req, res) {
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
                
                return res.status(201).json({
                    message: 'Rol de conductor agregado exitosamente',
                    user: { 
                        name: existingUser.name, 
                        email: existingUser.email, 
                        roles: [...existingUser.roles, 'conductor']
                    }
                });
            }
            
            const driver = new DriverUser(name, email, password, licencia, patente, vehiculo);
            await driver.register();

            return res.status(201).json({
                message: 'Registro de conductor exitoso',
                user: { name: driver.name, email: driver.email, roles: driver.roles }
            });
        } catch (error) {
            switch (error.code) {
                case 'DUP_EMAIL': return res.status(400).json({ error: 'El email ya está registrado' });
                case 'DUP_LICENCIA': return res.status(400).json({ error: 'La licencia ya está registrada' });
                case 'DUP_PATENTE': return res.status(400).json({ error: 'La patente ya está registrada' });
                default:
                    console.error("Error al registrar conductor:", error);
                    return res.status(500).json({ error: 'Error interno del servidor al registrar conductor' });
            }
        }
    }

    async passengerRegister(req, res) {
        try {
            const { name, email, password, telefono, direccion } = req.body;
            
            const existingUser = await User.findUserByEmail(email);
            
            if (existingUser) {
                if (existingUser.roles.includes('pasajero')) {
                    return res.status(400).json({ error: 'Ya estás registrado como pasajero' });
                }
                
                const passenger = new PassengerUser(
                    existingUser.name, 
                    existingUser.email, 
                    password, 
                    telefono, 
                    direccion,
                    existingUser.roles
                );
                await passenger.register(existingUser.id);
                
                return res.status(201).json({
                    message: 'Rol de pasajero agregado exitosamente',
                    user: { 
                        name: existingUser.name, 
                        email: existingUser.email, 
                        roles: [...existingUser.roles, 'pasajero']
                    }
                });
            }
            
            const passenger = new PassengerUser(name, email, password, telefono, direccion);
            await passenger.register();

            return res.status(201).json({
                message: 'Registro de pasajero exitoso',
                user: { name: passenger.name, email: passenger.email, roles: passenger.roles }
            });
        } catch (error) {
            if (error.code === 'DUP_EMAIL') {
                return res.status(400).json({ error: 'El email ya está registrado' });
            }
            console.error("Error al registrar pasajero:", error);
            return res.status(500).json({ error: 'Error interno del servidor al registrar pasajero' });
        }
    }

    checkStatus(req, res) {
        return res.status(200).json({ isAuthenticated: true, user: req.user });
    }
}
