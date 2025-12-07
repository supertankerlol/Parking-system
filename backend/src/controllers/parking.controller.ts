import { Request, Response, NextFunction } from 'express';
import * as parkingService from '../services/parking.service';

/**
 * Get parking spots (list)
 * GET /api/parking/spots
 * Query params: lat, lng, radius, page, limit, status, garageId
 */
export async function getSpots(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query: parkingService.GetSpotsQuery = {};

    // Parse query parameters
    if (req.query.lat) {
      query.lat = parseFloat(req.query.lat as string);
    }
    if (req.query.lng) {
      query.lng = parseFloat(req.query.lng as string);
    }
    if (req.query.radius) {
      query.radius = parseFloat(req.query.radius as string);
    }
    if (req.query.page) {
      query.page = parseInt(req.query.page as string, 10);
    }
    if (req.query.limit) {
      query.limit = parseInt(req.query.limit as string, 10);
    }
    if (req.query.status) {
      query.status = req.query.status as string;
    }
    if (req.query.garageId) {
      query.garageId = req.query.garageId as string;
    }

    const result = await parkingService.getSpots(query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Get parking spot by ID
 * GET /api/parking/spots/:id
 */
export async function getSpotById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        message: 'Spot ID is required',
      });
      return;
    }

    const spot = await parkingService.getSpotById(id);
    res.status(200).json({ spot });
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

/**
 * Get garage data with floors and spots
 * GET /api/parking/garages/:garageId
 */
export async function getGarage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { garageId } = req.params;

    if (!garageId) {
      res.status(400).json({
        message: 'Garage ID is required',
      });
      return;
    }

    const garage = await parkingService.getGarage(garageId);
    res.status(200).json({ garage });
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

/**
 * Update parking spot status
 * PATCH /api/parking/spots/:id/status
 */
export async function updateSpotStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
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

    const spot = await parkingService.updateSpotStatus(id, status);
    res.status(200).json({
      spot,
      message: 'Spot status updated successfully',
    });
  } catch (error: any) {
    if (error.message === 'Spot not found' || error.message.includes('Invalid status')) {
      res.status(400).json({
        message: error.message,
      });
      return;
    }
    next(error);
  }
}
