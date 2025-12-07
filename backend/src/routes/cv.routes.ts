import { Router } from 'express';
import * as parkingController from '../controllers/parking.controller';

const router = Router();

/**
 * POST /api/cv/events
 * CV webhook endpoint for spot status updates
 * Requires X-CV-TOKEN header for authentication
 */
router.post('/events', parkingController.postCvEvent);

export default router;
