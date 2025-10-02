import express from 'express';
import { login, logout, driverRegister, passengerRegister, checkStatus } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register/driver', driverRegister);
router.post('/register/passenger', passengerRegister);
router.post('/login', login);
router.post('/logout', logout);
router.get('/status', protect, checkStatus);
router.get('/profile', protect, function(req, res) {
    res.json({ message: 'Acceso autorizado a datos privados', user: req.user });
});

export default router;
