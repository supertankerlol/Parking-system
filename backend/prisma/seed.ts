import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (optional - be careful in production!)
  console.log('🧹 Cleaning existing data...');
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.parkingHistory.deleteMany();
  await prisma.cVEvent.deleteMany();
  await prisma.adminAudit.deleteMany();
  await prisma.spot.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.garage.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Users
  console.log('👤 Creating users...');
  const admin = await prisma.user.create({
    data: {
      fullName: 'Admin User',
      email: 'admin@parking.com',
      phone: '+77001234567',
      passwordHash: hashedPassword,
      role: 'admin',
      defaultLicense: 'ADM001',
    },
  });

  const owner = await prisma.user.create({
    data: {
      fullName: 'Parking Owner',
      email: 'owner@parking.com',
      phone: '+77001234568',
      passwordHash: hashedPassword,
      role: 'owner',
      defaultLicense: 'OWN001',
    },
  });

  const user1 = await prisma.user.create({
    data: {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+77001234569',
      passwordHash: hashedPassword,
      role: 'user',
      defaultLicense: 'ABC123',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      fullName: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+77001234570',
      passwordHash: hashedPassword,
      role: 'user',
      defaultLicense: 'XYZ789',
    },
  });

  // Create User Profiles
  console.log('📋 Creating user profiles...');
  await prisma.userProfile.create({
    data: {
      userId: user1.id,
      licenseNumber: 'ABC123',
      licenseExpiry: new Date('2025-12-31'),
      emergencyPhone: '+77009876543',
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'en',
      },
    },
  });

  await prisma.userProfile.create({
    data: {
      userId: user2.id,
      licenseNumber: 'XYZ789',
      licenseExpiry: new Date('2026-06-30'),
      emergencyPhone: '+77009876544',
      preferences: {
        theme: 'dark',
        notifications: true,
        language: 'kz',
      },
    },
  });

  // Create Garages
  console.log('🏢 Creating garages...');
  const garage1 = await prisma.garage.create({
    data: {
      name: 'Downtown Parking Center',
      address: 'Abay Avenue 150, Almaty',
      city: 'Almaty',
      lat: 43.238949,
      lng: 76.889709,
      type: 'indoor',
      status: 'active',
      totalSpots: 0, // Will be updated after creating spots
    },
  });

  const garage2 = await prisma.garage.create({
    data: {
      name: 'Shopping Mall Parking',
      address: 'Satpayev Street 90, Almaty',
      city: 'Almaty',
      lat: 43.250000,
      lng: 76.900000,
      type: 'mixed',
      status: 'active',
      totalSpots: 0,
    },
  });

  const garage3 = await prisma.garage.create({
    data: {
      name: 'Outdoor Parking Lot',
      address: 'Raiymbek Avenue 200, Almaty',
      city: 'Almaty',
      lat: 43.220000,
      lng: 76.850000,
      type: 'outdoor',
      status: 'active',
      totalSpots: 0,
    },
  });

  // Create Floors for Garage 1 (Indoor)
  console.log('🏗️ Creating floors...');
  const floorB1 = await prisma.floor.create({
    data: {
      garageId: garage1.id,
      name: 'B1',
      label: 'Basement 1',
      rows: 5,
      columns: 10,
      totalSpots: 0,
    },
  });

  const floorB2 = await prisma.floor.create({
    data: {
      garageId: garage1.id,
      name: 'B2',
      label: 'Basement 2',
      rows: 5,
      columns: 10,
      totalSpots: 0,
    },
  });

  const floor1 = await prisma.floor.create({
    data: {
      garageId: garage1.id,
      name: '1',
      label: 'Floor 1',
      rows: 4,
      columns: 8,
      totalSpots: 0,
    },
  });

  // Create Floors for Garage 2 (Mixed)
  const floor2B1 = await prisma.floor.create({
    data: {
      garageId: garage2.id,
      name: 'B1',
      label: 'Basement 1',
      rows: 6,
      columns: 12,
      totalSpots: 0,
    },
  });

  // Create Spots for Garage 1
  console.log('🅿️ Creating parking spots...');
  const spots1: string[] = [];
  
  // Create spots for B1 floor
  for (let row = 1; row <= 5; row++) {
    for (let col = 1; col <= 10; col++) {
      const spotId = `G1-B1-${String.fromCharCode(64 + row)}${col.toString().padStart(2, '0')}`;
      const spot = await prisma.spot.create({
        data: {
          id: spotId,
          garageId: garage1.id,
          floorId: floorB1.id,
          name: `${String.fromCharCode(64 + row)}${col.toString().padStart(2, '0')}`,
          description: `Basement 1, Row ${String.fromCharCode(64 + row)}, Column ${col}`,
          row: row,
          column: col,
          status: Math.random() > 0.7 ? 'occupied' : 'available',
          hourlyRate: 1.50,
          dayRate: 12.00,
          earlyBirdRate: 10.00,
          minimumDuration: 15,
        },
      });
      spots1.push(spot.id);
    }
  }

  // Create spots for B2 floor
  for (let row = 1; row <= 5; row++) {
    for (let col = 1; col <= 10; col++) {
      const spotId = `G1-B2-${String.fromCharCode(64 + row)}${col.toString().padStart(2, '0')}`;
      await prisma.spot.create({
        data: {
          id: spotId,
          garageId: garage1.id,
          floorId: floorB2.id,
          name: `${String.fromCharCode(64 + row)}${col.toString().padStart(2, '0')}`,
          description: `Basement 2, Row ${String.fromCharCode(64 + row)}, Column ${col}`,
          row: row,
          column: col,
          status: Math.random() > 0.7 ? 'occupied' : 'available',
          hourlyRate: 1.50,
          dayRate: 12.00,
          earlyBirdRate: 10.00,
          minimumDuration: 15,
        },
      });
      spots1.push(spotId);
    }
  }

  // Create spots for Floor 1
  for (let row = 1; row <= 4; row++) {
    for (let col = 1; col <= 8; col++) {
      const spotId = `G1-F1-${String.fromCharCode(64 + row)}${col.toString().padStart(2, '0')}`;
      await prisma.spot.create({
        data: {
          id: spotId,
          garageId: garage1.id,
          floorId: floor1.id,
          name: `${String.fromCharCode(64 + row)}${col.toString().padStart(2, '0')}`,
          description: `Floor 1, Row ${String.fromCharCode(64 + row)}, Column ${col}`,
          row: row,
          column: col,
          status: 'available',
          hourlyRate: 2.00,
          dayRate: 15.00,
          earlyBirdRate: 12.00,
          minimumDuration: 15,
        },
      });
      spots1.push(spotId);
    }
  }

  // Create spots for Garage 2
  const spots2: string[] = [];
  for (let row = 1; row <= 6; row++) {
    for (let col = 1; col <= 12; col++) {
      const spotId = `G2-B1-${String.fromCharCode(64 + row)}${col.toString().padStart(2, '0')}`;
      const spot = await prisma.spot.create({
        data: {
          id: spotId,
          garageId: garage2.id,
          floorId: floor2B1.id,
          name: `${String.fromCharCode(64 + row)}${col.toString().padStart(2, '0')}`,
          description: `Basement 1, Row ${String.fromCharCode(64 + row)}, Column ${col}`,
          row: row,
          column: col,
          status: Math.random() > 0.8 ? 'occupied' : 'available',
          hourlyRate: 1.75,
          dayRate: 13.00,
          earlyBirdRate: 11.00,
          minimumDuration: 15,
        },
      });
      spots2.push(spot.id);
    }
  }

  // Create outdoor spots for Garage 3 (no floors, with geolocation)
  const spots3: string[] = [];
  for (let i = 1; i <= 30; i++) {
    const spotId = `G3-OUT-${i.toString().padStart(3, '0')}`;
    const spot = await prisma.spot.create({
      data: {
        id: spotId,
        garageId: garage3.id,
        name: `Spot ${i}`,
        description: `Outdoor parking spot ${i}`,
        lat: garage3.lat! + (Math.random() - 0.5) * 0.001,
        lng: garage3.lng! + (Math.random() - 0.5) * 0.001,
        status: Math.random() > 0.75 ? 'occupied' : 'available',
        hourlyRate: 1.00,
        dayRate: 8.00,
        earlyBirdRate: 7.00,
        minimumDuration: 30,
      },
    });
    spots3.push(spot.id);
  }

  // Update garage total spots
  await prisma.garage.update({
    where: { id: garage1.id },
    data: { totalSpots: spots1.length },
  });

  await prisma.garage.update({
    where: { id: garage2.id },
    data: { totalSpots: spots2.length },
  });

  await prisma.garage.update({
    where: { id: garage3.id },
    data: { totalSpots: spots3.length },
  });

  // Update floor total spots
  await prisma.floor.update({
    where: { id: floorB1.id },
    data: { totalSpots: 50 },
  });

  await prisma.floor.update({
    where: { id: floorB2.id },
    data: { totalSpots: 50 },
  });

  await prisma.floor.update({
    where: { id: floor1.id },
    data: { totalSpots: 32 },
  });

  await prisma.floor.update({
    where: { id: floor2B1.id },
    data: { totalSpots: 72 },
  });

  // Create Bookings
  console.log('📅 Creating bookings...');
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const booking1 = await prisma.booking.create({
    data: {
      userId: user1.id,
      spotId: spots1[0],
      startTime: now,
      endTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
      status: 'in_progress',
      baseCost: 3.00,
      discountAmount: 0,
      totalCost: 3.00,
      notes: 'Regular parking session',
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      userId: user2.id,
      spotId: spots2[5],
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000), // 4 hours later
      status: 'confirmed',
      baseCost: 7.00,
      discountAmount: 0,
      totalCost: 7.00,
      notes: 'Pre-booked for shopping',
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      userId: user1.id,
      spotId: spots1[10],
      startTime: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Yesterday
      endTime: new Date(now.getTime() - 22 * 60 * 60 * 1000), // 2 hours later
      status: 'completed',
      baseCost: 3.00,
      discountAmount: 0,
      totalCost: 3.00,
    },
  });

  // Create Payments
  console.log('💳 Creating payments...');
  await prisma.payment.create({
    data: {
      userId: user1.id,
      bookingId: booking1.id,
      amount: 3.00,
      currency: 'KZT',
      method: 'card',
      status: 'completed',
      paidAt: now,
      transactionId: `TXN-${Date.now()}-001`,
    },
  });

  await prisma.payment.create({
    data: {
      userId: user1.id,
      bookingId: booking3.id,
      amount: 3.00,
      currency: 'KZT',
      method: 'card',
      status: 'completed',
      paidAt: new Date(now.getTime() - 22 * 60 * 60 * 1000),
      transactionId: `TXN-${Date.now() - 86400000}-002`,
    },
  });

  // Create Parking History
  console.log('📜 Creating parking history...');
  await prisma.parkingHistory.create({
    data: {
      userId: user1.id,
      spotId: spots1[0],
      garageId: garage1.id,
      eventType: 'occupied',
      sourceType: 'manual',
      metadata: {
        license_plate: user1.defaultLicense,
        notes: 'Vehicle parked',
      },
      timestamp: now,
    },
  });

  await prisma.parkingHistory.create({
    data: {
      userId: user1.id,
      spotId: spots1[10],
      garageId: garage1.id,
      eventType: 'left',
      sourceType: 'manual',
      metadata: {
        license_plate: user1.defaultLicense,
        notes: 'Vehicle left',
      },
      timestamp: new Date(now.getTime() - 22 * 60 * 60 * 1000),
    },
  });

  // Create CV Events
  console.log('📷 Creating CV events...');
  await prisma.cVEvent.create({
    data: {
      spotId: spots1[5],
      cameraId: 'CAM-B1-01',
      status: 'occupied',
      confidence: 0.95,
      licensePlate: 'ABC123',
      timestamp: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
      processed: true,
      processedAt: new Date(now.getTime() - 29 * 60 * 1000),
    },
  });

  // Create Admin Audit Logs
  console.log('📝 Creating admin audit logs...');
  await prisma.adminAudit.create({
    data: {
      adminId: admin.id,
      action: 'create_garage',
      targetType: 'garage',
      targetId: garage1.id,
      changes: {
        before: null,
        after: {
          name: garage1.name,
          address: garage1.address,
        },
      },
      reason: 'Initial garage setup',
    },
  });

  await prisma.adminAudit.create({
    data: {
      adminId: admin.id,
      action: 'update_spot',
      targetType: 'spot',
      targetId: spots1[0],
      changes: {
        before: { status: 'available' },
        after: { status: 'occupied' },
      },
      reason: 'Spot occupied by user',
    },
  });

  console.log('✅ Database seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: 4 (1 admin, 1 owner, 2 regular)`);
  console.log(`   - Garages: 3`);
  console.log(`   - Floors: 4`);
  console.log(`   - Spots: ${spots1.length + spots2.length + spots3.length}`);
  console.log(`   - Bookings: 3`);
  console.log(`   - Payments: 2`);
  console.log(`   - History entries: 2`);
  console.log(`   - CV Events: 1`);
  console.log(`   - Admin Audits: 2`);
  console.log('\n🔑 Default login credentials:');
  console.log('   Admin: admin@parking.com / password123');
  console.log('   Owner: owner@parking.com / password123');
  console.log('   User: john.doe@example.com / password123');
  console.log('   User: jane.smith@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
