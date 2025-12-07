import { Router } from 'express';
import * as parkingController from '../controllers/parking.controller';

const router = Router();

/**
 * GET /api/parking/spots
 * Get parking spots (list) with optional filtering
 * Query params: lat, lng, radius, page, limit, status, garageId
 */
router.get('/spots', parkingController.getSpots);

/**
 * GET /api/parking/spots/:id
 * Get parking spot by ID
 */
router.get('/spots/:id', parkingController.getSpotById);

/**
 * GET /api/parking/garages/:garageId
 * Get garage data with floors and spots
 */
router.get('/garages/:garageId', parkingController.getGarage);

/**
 * PATCH /api/parking/spots/:id/status
 * Update parking spot status
 */
router.patch('/spots/:id/status', parkingController.updateSpotStatus);

export default router;
