//backend/controllers/profileController.js
import UserProfile from '../models/UserProfile.js';

export class ProfileController {
    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const userRoles = req.user.roles;
            const { name, vehiculo, patente, currentPassword, newPassword } = req.body;

            if (newPassword && !currentPassword) {
                return res.status(400).json({ success: false, error: 'Debe ingresar la contraseña actual para cambiarla' });
            }

            const updateData = {
                name,
                currentPassword,
                newPassword,
                vehiculo,
                patente,
                roles: userRoles
            };
            
            await UserProfile.update(userId, updateData);

            return res.json({ success: true, message: 'Perfil actualizado correctamente' });
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            
            if (error.code === 'INVALID_PASSWORD') {
                return res.status(401).json({ success: false, error: 'Contraseña actual incorrecta' });
            }
            
            return res.status(500).json({ success: false, error: 'Error interno al actualizar perfil' });
        }
    }

    async getProfile(req, res) {
        try {
            const userId = req.user.id;
            
            const user = await UserProfile.getProfileData(userId);
            
            if (!user) {
                 return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
            }

            return res.json({ success: true, user });
        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            return res.status(500).json({ success: false, error: 'Error interno al obtener perfil' });
        }
    }

    async getPassengerStats(req, res) {
        try {
            const userId = req.user.id; 
            const stats = await UserProfile.getPassengerStats(userId);
            return res.json({ success: true, stats });
        } catch (error) {
            console.error('Error obteniendo estadísticas del pasajero:', error);
            return res.status(500).json({ success: false, error: 'Error interno al obtener estadísticas' });
        }
    }
}

export default new ProfileController();