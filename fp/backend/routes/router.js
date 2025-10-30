// backend/routes/router.js
import express from 'express';
import { AuthController } from '../controllers/authController.js';
import { SessionService } from '../services/SessionService.js';
import TripCtrl from '../controllers/tripController.js';
import ProfileCtrl from '../controllers/profileController.js';

const router = express.Router();
const authCtrl = new AuthController();
const sessionService = new SessionService();

// Authentication 
router.post('/register/driver', authCtrl.driverRegister.bind(authCtrl));
router.post('/register/passenger', authCtrl.passengerRegister.bind(authCtrl));
router.post('/login', authCtrl.login.bind(authCtrl));
router.post('/logout', authCtrl.logout.bind(authCtrl));

// Trips 

// Rutas específicas 
router.post('/trips', sessionService.protect, TripCtrl.createTrip.bind(TripCtrl));
router.get('/trips/my', sessionService.protect, TripCtrl.getUserTrips.bind(TripCtrl));
router.get('/trips/my/requests', sessionService.protect, TripCtrl.getAllDriverRequests.bind(TripCtrl));
router.get('/trips/search', sessionService.protect, TripCtrl.searchTrips.bind(TripCtrl));
router.get('/trips/available', sessionService.protect, TripCtrl.getAvailableTrips.bind(TripCtrl));
router.get('/trips/my-requests', sessionService.protect, TripCtrl.getMyRequests.bind(TripCtrl));

// Rutas genéricas 
router.get('/trips/:id', sessionService.protect, TripCtrl.getTripById.bind(TripCtrl));
router.get('/trips/:id/requests', sessionService.protect, TripCtrl.getRequests.bind(TripCtrl));
router.post('/trips/:id/request', sessionService.protect, TripCtrl.requestSeat.bind(TripCtrl));
router.put('/trips/:id/status', sessionService.protect, TripCtrl.changeTripStatus.bind(TripCtrl));
router.put('/trips/requests/:id', sessionService.protect, TripCtrl.respondRequest.bind(TripCtrl));

// Profile
router.get('/profile', sessionService.protect, ProfileCtrl.getProfile.bind(ProfileCtrl));
router.put('/profile', sessionService.protect, ProfileCtrl.updateProfile.bind(ProfileCtrl));
router.get('/status', sessionService.protect, authCtrl.checkStatus.bind(authCtrl));

export default router;