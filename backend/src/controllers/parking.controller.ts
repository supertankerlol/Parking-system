import { Request, Response, NextFunction } from 'express';
import * as parkingService from '../services/parking.service';
import { config } from '../config';
import { prisma } from '../repositories/prisma.client';
import { emitSpotUpdate } from '../sockets/socket';

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

/**
 * CV webhook handler
 * POST /api/cv/events
 * Handles computer vision events for spot status updates
 */
export async function postCvEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Validate X-CV-TOKEN header
    const token = req.headers['x-cv-token'] as string;
    if (!token || token !== config.cv.secret) {
      res.status(401).json({
        message: 'Unauthorized: Invalid or missing X-CV-TOKEN',
      });
      return;
    }

    // Parse request body
    const { spotId, status, timestamp, source } = req.body;

    if (!spotId) {
      res.status(400).json({
        message: 'spotId is required',
      });
      return;
    }

    if (!status || !['occupied', 'free'].includes(status)) {
      res.status(400).json({
        message: 'status is required and must be "occupied" or "free"',
      });
      return;
    }

    // Get spot to verify it exists and get garageId
    const spot = await prisma.spot.findUnique({
      where: { id: spotId },
      select: {
        id: true,
        garageId: true,
        status: true,
      },
    });

    if (!spot) {
      res.status(404).json({
        message: 'Spot not found',
      });
      return;
    }

    // Map CV status to spot status
    // "occupied" -> "occupied", "free" -> "available"
    const spotStatus = status === 'occupied' ? 'occupied' : 'available';
    const eventTimestamp = timestamp ? new Date(timestamp) : new Date();
    const lastSeenAt = eventTimestamp;

    // Update spot status and lastSeenAt in a transaction
    const updatedSpot = await prisma.$transaction(async (tx) => {
      // Update spot
      const updated = await tx.spot.update({
        where: { id: spotId },
        data: {
          status: spotStatus,
          lastSeenAt,
        },
      });

      // Determine event type for parking history
      const eventType = status === 'occupied' ? 'cv_detected' : 'left';

      // Insert parking_history record
      await tx.parkingHistory.create({
        data: {
          spotId,
          garageId: spot.garageId,
          eventType,
          sourceType: 'cv',
          metadata: {
            source: source || 'cv_system',
            timestamp: eventTimestamp.toISOString(),
            previousStatus: spot.status,
            newStatus: spotStatus,
          },
          timestamp: eventTimestamp,
        },
      });

      return updated;
    });

    // Emit socket event
    emitSpotUpdate({
      spotId: updatedSpot.id,
      status: updatedSpot.status,
      lastSeenAt: updatedSpot.lastSeenAt,
    });

    res.status(200).json({
      message: 'CV event processed successfully',
      spot: {
        id: updatedSpot.id,
        status: updatedSpot.status,
        lastSeenAt: updatedSpot.lastSeenAt,
      },
    });
  } catch (error) {
    next(error);
  }
}
