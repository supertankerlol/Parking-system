import { Router } from 'express';
import * as parkingController from '../controllers/parking.controller';

const router = Router();

/**
 * GET /api/parking
 * Get parking spots (list) with optional filtering
 * Query params: lat, lng, radius, page, limit, status, garageId
 * Public endpoint - no authentication required
 */
router.get('/', parkingController.getSpots);

/**
 * GET /api/parking/garage/:garageId
 * Get garage data with floors and spots (indoor data)
 * Public endpoint - no authentication required
 * Note: This route must come before /:id to avoid route conflicts
 */
router.get('/garage/:garageId', parkingController.getGarage);

/**
 * GET /api/parking/:id
 * Get parking spot by ID
 * Public endpoint - no authentication required
 */
router.get('/:id', parkingController.getSpotById);

/**
 * PATCH /api/parking/spots/:id/status
 * Update parking spot status
 * Note: This endpoint may require authentication in the future
 */
router.patch('/spots/:id/status', parkingController.updateSpotStatus);

export default router;
