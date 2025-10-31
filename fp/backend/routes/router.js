// backend/routes/router.js
import express from 'express';
import * as AuthCtrl from '../controllers/authController.js';
import { SessionService } from '../services/SessionService.js';
import TripCtrl from '../controllers/tripController.js';
import ProfileCtrl from '../controllers/profileController.js';
import RatingCtrl from '../controllers/ratingController.js';

const router = express.Router();
const sessionService = new SessionService();

// Authentication 
router.post('/register/driver', AuthCtrl.driverRegister);
router.post('/register/passenger', AuthCtrl.passengerRegister);
router.post('/login', AuthCtrl.login);
router.post('/logout', AuthCtrl.logout);

// Trips 
router.post('/trips', sessionService.protect, TripCtrl.createTrip.bind(TripCtrl));
router.get('/trips/my', sessionService.protect, TripCtrl.getUserTrips.bind(TripCtrl));
router.get('/trips/my/requests', sessionService.protect, TripCtrl.getAllDriverRequests.bind(TripCtrl));
router.get('/trips/search', sessionService.protect, TripCtrl.searchTrips.bind(TripCtrl));
router.get('/trips/available', sessionService.protect, TripCtrl.getAvailableTrips.bind(TripCtrl));
router.get('/trips/my-requests', sessionService.protect, TripCtrl.getMyRequests.bind(TripCtrl));

// Rutas especificas 
router.get('/trips/:id', sessionService.protect, TripCtrl.getTripById.bind(TripCtrl));
router.get('/trips/:id/requests', sessionService.protect, TripCtrl.getRequests.bind(TripCtrl));
router.post('/trips/:id/request', sessionService.protect, TripCtrl.requestSeat.bind(TripCtrl));
router.put('/trips/:id/status', sessionService.protect, TripCtrl.changeTripStatus.bind(TripCtrl));
router.put('/trips/:id/cancel', sessionService.protect, TripCtrl.cancelTrip.bind(TripCtrl)); // NUEVA RUTA
router.put('/trips/requests/:id', sessionService.protect, TripCtrl.respondRequest.bind(TripCtrl));
router.post('/trips/requests/:id/cancel', sessionService.protect, TripCtrl.cancelBooking.bind(TripCtrl)); // NUEVA RUTA
router.delete('/trips/:id', sessionService.protect, TripCtrl.deleteTrip.bind(TripCtrl));

// Profile
router.get('/profile', sessionService.protect, ProfileCtrl.getProfile.bind(ProfileCtrl));
router.put('/profile', sessionService.protect, ProfileCtrl.updateProfile.bind(ProfileCtrl));
router.get('/status', sessionService.protect, AuthCtrl.checkStatus);

// Ratings
router.post('/ratings', sessionService.protect, RatingCtrl.submitRating.bind(RatingCtrl));

export default router;