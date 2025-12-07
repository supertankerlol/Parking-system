import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';

const router = Router();

// Apply authentication and admin middleware to all routes
router.use(authenticate);
router.use(requireAdmin);

// ════════════════════════════════════════════════════════════
// GARAGE ROUTES
// ════════════════════════════════════════════════════════════

/**
 * POST /api/admin/garages
 * Create a new garage
 * Body: { name, address, city?, lat?, lng?, type?, status? }
 * Protected by authentication and admin middleware
 */
router.post('/garages', adminController.createGarage);

/**
 * PUT /api/admin/garages/:id
 * Update a garage
 * Body: { name?, address?, city?, lat?, lng?, type?, status?, totalSpots? }
 * Protected by authentication and admin middleware
 */
router.put('/garages/:id', adminController.updateGarage);

/**
 * DELETE /api/admin/garages/:id
 * Soft delete a garage (sets status to 'closed')
 * Protected by authentication and admin middleware
 */
router.delete('/garages/:id', adminController.softDeleteGarage);

// ════════════════════════════════════════════════════════════
// FLOOR ROUTES
// ════════════════════════════════════════════════════════════

/**
 * POST /api/admin/floors
 * Create a new floor
 * Body: { garageId, name, label, rows?, columns?, totalSpots? }
 * Protected by authentication and admin middleware
 */
router.post('/floors', adminController.createFloor);

/**
 * PUT /api/admin/floors/:id
 * Update a floor
 * Body: { name?, label?, rows?, columns?, totalSpots? }
 * Protected by authentication and admin middleware
 */
router.put('/floors/:id', adminController.updateFloor);

/**
 * DELETE /api/admin/floors/:id
 * Delete a floor (hard delete)
 * Protected by authentication and admin middleware
 */
router.delete('/floors/:id', adminController.deleteFloor);

// ════════════════════════════════════════════════════════════
// SPOT ROUTES
// ════════════════════════════════════════════════════════════

/**
 * POST /api/admin/spots
 * Create a new parking spot
 * Body: { garageId, floorId?, name, description?, row?, column?, lat?, lng?, status?, hourlyRate?, dayRate?, earlyBirdRate?, minimumDuration? }
 * Protected by authentication and admin middleware
 */
router.post('/spots', adminController.createSpot);

/**
 * PUT /api/admin/spots/:id
 * Update a parking spot
 * Body: { name?, description?, row?, column?, lat?, lng?, status?, hourlyRate?, dayRate?, earlyBirdRate?, minimumDuration?, floorId? }
 * Protected by authentication and admin middleware
 */
router.put('/spots/:id', adminController.updateSpot);

/**
 * PATCH /api/admin/spots/:id/status
 * Change spot status
 * Body: { status }
 * Protected by authentication and admin middleware
 */
router.patch('/spots/:id/status', adminController.changeSpotStatus);

/**
 * DELETE /api/admin/spots/:id
 * Delete a parking spot (hard delete)
 * Protected by authentication and admin middleware
 */
router.delete('/spots/:id', adminController.deleteSpot);

// ════════════════════════════════════════════════════════════
// BOOKING ROUTES
// ════════════════════════════════════════════════════════════

/**
 * GET /api/admin/bookings
 * Get all bookings with optional filters
 * Query params: userId?, spotId?, status?, startTimeFrom?, startTimeTo?, page?, limit?
 * Protected by authentication and admin middleware
 */
router.get('/bookings', adminController.adminGetBookings);

// ════════════════════════════════════════════════════════════
// DASHBOARD ROUTES
// ════════════════════════════════════════════════════════════

/**
 * GET /api/admin/dashboard
 * Get admin dashboard statistics
 * Returns: spot status counts, active reservations count, recent parking history
 * Protected by authentication and admin middleware
 */
router.get('/dashboard', adminController.adminDashboard);

export default router;
