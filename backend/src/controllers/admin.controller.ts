import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service';

// ════════════════════════════════════════════════════════════
// GARAGE CONTROLLERS
// ════════════════════════════════════════════════════════════

/**
 * Create a new garage
 * POST /api/admin/garages
 * Body: { name, address, city?, lat?, lng?, type?, status? }
 * Protected by authentication and admin middleware
 */
export async function createGarage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data: adminService.CreateGarageInput = req.body;

    if (!data.name || !data.address) {
      res.status(400).json({
        message: 'Name and address are required',
      });
      return;
    }

    const garage = await adminService.createGarage(data);

    res.status(201).json({
      garage,
      message: 'Garage created successfully',
    });
  } catch (error: any) {
    if (error.message.includes('required') || error.message.includes('invalid')) {
      res.status(400).json({
        message: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
 * Update a garage
 * PUT /api/admin/garages/:id
 * Body: { name?, address?, city?, lat?, lng?, type?, status?, totalSpots? }
 * Protected by authentication and admin middleware
 */
export async function updateGarage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const data: adminService.UpdateGarageInput = req.body;

    if (!id) {
      res.status(400).json({
        message: 'Garage ID is required',
      });
      return;
    }

    const garage = await adminService.updateGarage(id, data);

    res.status(200).json({
      garage,
      message: 'Garage updated successfully',
    });
  } catch (error: any) {
    if (error.message === 'Garage not found') {
      res.status(404).json({
        message: error.message,
      });
      return;
    }
    if (error.message.includes('required') || error.message.includes('invalid')) {
      res.status(400).json({
        message: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
 * Soft delete a garage
 * DELETE /api/admin/garages/:id
 * Protected by authentication and admin middleware
 */
export async function softDeleteGarage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        message: 'Garage ID is required',
      });
      return;
    }

    const garage = await adminService.softDeleteGarage(id);

    res.status(200).json({
      garage,
      message: 'Garage deleted successfully',
    });
  } catch (error: any) {
    if (error.message === 'Garage not found') {
      res.status(404).json({
        message: error.message,
      });
      return;
    }
    next(error);
  }
}

// ════════════════════════════════════════════════════════════
// FLOOR CONTROLLERS
// ════════════════════════════════════════════════════════════

/**
 * Create a new floor
 * POST /api/admin/floors
 * Body: { garageId, name, label, rows?, columns?, totalSpots? }
 * Protected by authentication and admin middleware
 */
export async function createFloor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data: adminService.CreateFloorInput = req.body;

    if (!data.garageId || !data.name || !data.label) {
      res.status(400).json({
        message: 'Garage ID, name, and label are required',
      });
      return;
    }

    const floor = await adminService.createFloor(data);

    res.status(201).json({
      floor,
      message: 'Floor created successfully',
    });
  } catch (error: any) {
    if (error.message === 'Garage not found') {
      res.status(404).json({
        message: error.message,
      });
      return;
    }
    if (error.message.includes('already exists')) {
      res.status(409).json({
        message: error.message,
      });
      return;
    }
    if (error.message.includes('required')) {
      res.status(400).json({
        message: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
 * Update a floor
 * PUT /api/admin/floors/:id
 * Body: { name?, label?, rows?, columns?, totalSpots? }
 * Protected by authentication and admin middleware
 */
export async function updateFloor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const data: adminService.UpdateFloorInput = req.body;

    if (!id) {
      res.status(400).json({
        message: 'Floor ID is required',
      });
      return;
    }

    const floor = await adminService.updateFloor(id, data);

    res.status(200).json({
      floor,
      message: 'Floor updated successfully',
    });
  } catch (error: any) {
    if (error.message === 'Floor not found') {
      res.status(404).json({
        message: error.message,
      });
      return;
    }
    if (error.message.includes('already exists')) {
      res.status(409).json({
        message: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
 * Delete a floor
 * DELETE /api/admin/floors/:id
 * Protected by authentication and admin middleware
 */
export async function deleteFloor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        message: 'Floor ID is required',
      });
      return;
    }

    const floor = await adminService.deleteFloor(id);

    res.status(200).json({
      floor,
      message: 'Floor deleted successfully',
    });
  } catch (error: any) {
    if (error.message === 'Floor not found') {
      res.status(404).json({
        message: error.message,
      });
      return;
    }
    next(error);
  }
}

// ════════════════════════════════════════════════════════════
// SPOT CONTROLLERS
// ════════════════════════════════════════════════════════════

/**
 * Create a new parking spot
 * POST /api/admin/spots
 * Body: { garageId, floorId?, name, description?, row?, column?, lat?, lng?, status?, hourlyRate?, dayRate?, earlyBirdRate?, minimumDuration? }
 * Protected by authentication and admin middleware
 */
export async function createSpot(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data: adminService.CreateSpotInput = req.body;

    if (!data.garageId || !data.name) {
      res.status(400).json({
        message: 'Garage ID and name are required',
      });
      return;
    }

    const spot = await adminService.createSpot(data);

    res.status(201).json({
      spot,
      message: 'Spot created successfully',
    });
  } catch (error: any) {
    if (error.message === 'Garage not found' || error.message === 'Floor not found') {
      res.status(404).json({
        message: error.message,
      });
      return;
    }
    if (error.message.includes('already exists') || error.message.includes('does not belong')) {
      res.status(409).json({
        message: error.message,
      });
      return;
    }
    if (error.message.includes('required')) {
      res.status(400).json({
        message: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
 * Update a parking spot
 * PUT /api/admin/spots/:id
 * Body: { name?, description?, row?, column?, lat?, lng?, status?, hourlyRate?, dayRate?, earlyBirdRate?, minimumDuration?, floorId? }
 * Protected by authentication and admin middleware
 */
export async function updateSpot(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const data: adminService.UpdateSpotInput = req.body;

    if (!id) {
      res.status(400).json({
        message: 'Spot ID is required',
      });
      return;
    }

    const spot = await adminService.updateSpot(id, data);

    res.status(200).json({
      spot,
      message: 'Spot updated successfully',
    });
  } catch (error: any) {
    if (error.message === 'Spot not found') {
      res.status(404).json({
        message: error.message,
      });
      return;
    }
    if (error.message.includes('already exists')) {
      res.status(409).json({
        message: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
 * Change spot status
 * PATCH /api/admin/spots/:id/status
 * Body: { status }
 * Protected by authentication and admin middleware
 */
export async function changeSpotStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      res.status(400).json({
        message: 'Spot ID is required',
      });
      return;
    }

    if (!status) {
      res.status(400).json({
        message: 'Status is required',
      });
      return;
    }

    const spot = await adminService.changeSpotStatus(id, status);

    res.status(200).json({
      spot,
      message: 'Spot status updated successfully',
    });
  } catch (error: any) {
    if (error.message === 'Spot not found') {
      res.status(404).json({
        message: error.message,
      });
      return;
    }
    if (error.message.includes('Invalid status')) {
      res.status(400).json({
        message: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
 * Delete a parking spot
 * DELETE /api/admin/spots/:id
 * Protected by authentication and admin middleware
 */
export async function deleteSpot(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        message: 'Spot ID is required',
      });
      return;
    }

    const spot = await adminService.deleteSpot(id);

    res.status(200).json({
      spot,
      message: 'Spot deleted successfully',
    });
  } catch (error: any) {
    if (error.message === 'Spot not found') {
      res.status(404).json({
        message: error.message,
      });
      return;
    }
    next(error);
  }
}

// ════════════════════════════════════════════════════════════
// BOOKING CONTROLLERS
// ════════════════════════════════════════════════════════════

/**
 * Get all bookings with filters (admin)
 * GET /api/admin/bookings
 * Query params: userId?, spotId?, status?, startTimeFrom?, startTimeTo?, page?, limit?
 * Protected by authentication and admin middleware
 */
export async function adminGetBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters: adminService.BookingFilters = {};

    // Parse query parameters
    if (req.query.userId) {
      filters.userId = req.query.userId as string;
    }
    if (req.query.spotId) {
      filters.spotId = req.query.spotId as string;
    }
    if (req.query.status) {
      filters.status = req.query.status as string;
    }
    if (req.query.startTimeFrom) {
      filters.startTimeFrom = req.query.startTimeFrom as string;
    }
    if (req.query.startTimeTo) {
      filters.startTimeTo = req.query.startTimeTo as string;
    }
    if (req.query.page) {
      filters.page = parseInt(req.query.page as string, 10);
    }
    if (req.query.limit) {
      filters.limit = parseInt(req.query.limit as string, 10);
    }

    const result = await adminService.adminGetBookings(filters);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

// ════════════════════════════════════════════════════════════
// DASHBOARD CONTROLLERS
// ════════════════════════════════════════════════════════════

/**
 * Get admin dashboard statistics
 * GET /api/admin/dashboard
 * Protected by authentication and admin middleware
 */
export async function adminDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await adminService.adminDashboard();

    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
}
