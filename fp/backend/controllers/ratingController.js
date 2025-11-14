import Rating from '../models/Rating.js';
import Trip from '../models/Trip.js';

export class RatingController {
    async submitRating(req, res) {
        try {
            const calificadorId = req.user.id;
            const { viajeId, calificadoId, calificacion, comentario } = req.body;

            if (!calificadoId) {
                return res.status(400).json({ success: false, error: 'Debe especificar a quién calificar.' });
            }

            const trip = await Trip.getById(viajeId);
            if (!trip) {
                return res.status(404).json({ success: false, error: 'Viaje no encontrado' });
            }

            await Rating.create(viajeId, calificadorId, calificadoId, calificacion, comentario);
            return res.status(201).json({ success: true, message: 'Calificación guardada exitosamente' });
        } catch (error) {
            console.error('Error al guardar calificación:', error);
            return res.status(500).json({ success: false, error: 'Error interno al guardar la calificación' });
        }
    }
}

export default new RatingController();