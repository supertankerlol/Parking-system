/**
 * CV Event Simulator
 * 
 * This script simulates computer vision events by posting mock data
 * to the CV webhook endpoint for testing purposes.
 * 
 * Usage:
 *   1. Make sure the backend server is running
 *   2. Set CV_SECRET in your .env file
 *   3. Install axios if not already installed: npm install axios
 *   4. Run: npx ts-node src/scripts/simulate-cv.ts
 * 
 * Options:
 *   - Single event: npx ts-node src/scripts/simulate-cv.ts --spot G1-B1-A01 --status occupied
 *   - Multiple events: npx ts-node src/scripts/simulate-cv.ts --count 5
 *   - Custom server: npx ts-node src/scripts/simulate-cv.ts --url http://localhost:5000
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const DEFAULT_URL = process.env.API_URL || 'http://localhost:5000';
const CV_SECRET = process.env.CV_SECRET || 'test-secret-key';
const WEBHOOK_ENDPOINT = '/api/cv/events';

// Sample spot IDs (from seed data - adjust based on your database)
const SAMPLE_SPOTS = [
  'G1-B1-A01',
  'G1-B1-A02',
  'G1-B1-A03',
  'G1-B1-B01',
  'G1-B1-B02',
  'G1-B2-A01',
  'G1-B2-A02',
  'G2-B1-A01',
  'G2-B1-A02',
  'G3-L1-A01',
];

// Sample camera sources
const CAMERA_SOURCES = [
  'camera-001',
  'camera-002',
  'camera-003',
  'camera-entrance',
  'camera-exit',
];

interface CvEvent {
  spotId: string;
  status: 'occupied' | 'free';
  timestamp?: string;
  source?: string;
}

/**
 * Send a single CV event to the webhook
 */
async function sendCvEvent(
  event: CvEvent,
  url: string = DEFAULT_URL,
  token: string = CV_SECRET
): Promise<void> {
  try {
    const response = await axios.post(`${url}${WEBHOOK_ENDPOINT}`, event, {
      headers: {
        'X-CV-TOKEN': token,
        'Content-Type': 'application/json',
      },
    });

    console.log(`✅ Event sent successfully:`, {
      spotId: event.spotId,
      status: event.status,
      response: response.status,
      message: response.data.message,
    });
  } catch (error: any) {
    if (error.response) {
      console.error(`❌ Error sending event:`, {
        spotId: event.spotId,
        status: event.status,
        statusCode: error.response.status,
        message: error.response.data?.message || error.message,
      });
    } else {
      console.error(`❌ Network error:`, error.message);
    }
    throw error;
  }
}

/**
 * Generate a random CV event
 */
function generateRandomEvent(): CvEvent {
  const spotId = SAMPLE_SPOTS[Math.floor(Math.random() * SAMPLE_SPOTS.length)];
  const status: 'occupied' | 'free' = Math.random() > 0.5 ? 'occupied' : 'free';
  const source = CAMERA_SOURCES[Math.floor(Math.random() * CAMERA_SOURCES.length)];
  const timestamp = new Date().toISOString();

  return {
    spotId,
    status,
    timestamp,
    source,
  };
}

/**
 * Simulate multiple events with delays
 */
async function simulateMultipleEvents(
  count: number = 5,
  delayMs: number = 2000,
  url: string = DEFAULT_URL,
  token: string = CV_SECRET
): Promise<void> {
  console.log(`\n🚀 Starting simulation: ${count} events with ${delayMs}ms delay\n`);

  for (let i = 0; i < count; i++) {
    const event = generateRandomEvent();
    console.log(`[${i + 1}/${count}] Sending event...`);
    
    try {
      await sendCvEvent(event, url, token);
    } catch (error) {
      console.error(`Failed to send event ${i + 1}`);
    }

    // Wait before next event (except for the last one)
    if (i < count - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  console.log(`\n✅ Simulation completed!\n`);
}

/**
 * Simulate a realistic scenario: car arriving and leaving
 */
async function simulateScenario(
  spotId: string,
  url: string = DEFAULT_URL,
  token: string = CV_SECRET
): Promise<void> {
  console.log(`\n🎬 Simulating realistic scenario for spot: ${spotId}\n`);

  // Car arrives
  console.log('1️⃣ Car arriving...');
  await sendCvEvent(
    {
      spotId,
      status: 'occupied',
      timestamp: new Date().toISOString(),
      source: 'camera-entrance',
    },
    url,
    token
  );

  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Car leaves
  console.log('2️⃣ Car leaving...');
  await sendCvEvent(
    {
      spotId,
      status: 'free',
      timestamp: new Date().toISOString(),
      source: 'camera-exit',
    },
    url,
    token
  );

  console.log(`\n✅ Scenario completed!\n`);
}

/**
 * Main function
 */
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const spotArg = args.find((arg) => arg.startsWith('--spot='))?.split('=')[1];
  const statusArg = args.find((arg) => arg.startsWith('--status='))?.split('=')[1] as 'occupied' | 'free' | undefined;
  const countArg = args.find((arg) => arg.startsWith('--count='))?.split('=')[1];
  const urlArg = args.find((arg) => arg.startsWith('--url='))?.split('=')[1];
  const tokenArg = args.find((arg) => arg.startsWith('--token='))?.split('=')[1];
  const scenarioArg = args.includes('--scenario');

  const url = urlArg || DEFAULT_URL;
  const token = tokenArg || CV_SECRET;

  console.log('📡 CV Event Simulator');
  console.log('='.repeat(50));
  console.log(`Server URL: ${url}`);
  console.log(`Webhook: ${url}${WEBHOOK_ENDPOINT}`);
  console.log('='.repeat(50));

  try {
    // Single event with specific spot and status
    if (spotArg && statusArg) {
      if (!['occupied', 'free'].includes(statusArg)) {
        console.error('❌ Status must be "occupied" or "free"');
        process.exit(1);
      }

      await sendCvEvent(
        {
          spotId: spotArg,
          status: statusArg,
          timestamp: new Date().toISOString(),
          source: 'simulator',
        },
        url,
        token
      );
    }
    // Scenario simulation
    else if (scenarioArg) {
      const spotId = spotArg || SAMPLE_SPOTS[0];
      await simulateScenario(spotId, url, token);
    }
    // Multiple random events
    else {
      const count = countArg ? parseInt(countArg, 10) : 5;
      if (isNaN(count) || count < 1) {
        console.error('❌ Count must be a positive number');
        process.exit(1);
      }
      await simulateMultipleEvents(count, 2000, url, token);
    }
  } catch (error: any) {
    console.error('\n❌ Simulation failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

export { sendCvEvent, generateRandomEvent, simulateMultipleEvents, simulateScenario };
