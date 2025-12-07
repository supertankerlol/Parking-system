#!/usr/bin/env node
/**
 * Script to set up test database configuration
 * This script reads DATABASE_URL from .env and creates DATABASE_URL_TEST
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const envPath = path.join(__dirname, '..', '.env');

function setupTestDatabase() {
  console.log('🔧 Setting up test database configuration...\n');

  // Check if DATABASE_URL exists
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL is not set in your .env file');
    console.error('   Please add DATABASE_URL to your .env file first');
    process.exit(1);
  }

  // Parse DATABASE_URL
  // Format: postgresql://username:password@host:port/database
  const urlPattern = /^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;
  const match = databaseUrl.match(urlPattern);

  if (!match) {
    console.error('❌ ERROR: Could not parse DATABASE_URL format');
    console.error('   Expected format: postgresql://username:password@host:port/database');
    console.error(`   Got: ${databaseUrl}`);
    process.exit(1);
  }

  const [, username, password, host, port, database] = match;

  console.log('📊 Detected database connection:');
  console.log(`   Host: ${host}`);
  console.log(`   Port: ${port}`);
  console.log(`   Username: ${username}`);
  console.log(`   Database: ${database}\n`);

  // Create test database URL
  const testDatabaseUrl = `postgresql://${username}:${password}@${host}:${port}/parking_system_test`;

  console.log('✅ Test database URL will be:');
  console.log(`   ${testDatabaseUrl}\n`);

  // Read existing .env file
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Check if DATABASE_URL_TEST already exists
  if (envContent.includes('DATABASE_URL_TEST')) {
    console.log('⚠️  DATABASE_URL_TEST already exists in .env file');
    console.log('   Updating it...\n');
    
    // Replace existing DATABASE_URL_TEST
    envContent = envContent.replace(
      /DATABASE_URL_TEST=.*/g,
      `DATABASE_URL_TEST=${testDatabaseUrl}`
    );
  } else {
    console.log('➕ Adding DATABASE_URL_TEST to .env file...\n');
    
    // Add DATABASE_URL_TEST to .env
    if (envContent && !envContent.endsWith('\n')) {
      envContent += '\n';
    }
    envContent += `DATABASE_URL_TEST=${testDatabaseUrl}\n`;
  }

  // Write back to .env file
  fs.writeFileSync(envPath, envContent, 'utf8');

  console.log('✅ DATABASE_URL_TEST has been added to .env file\n');

  // Provide next steps
  console.log('📋 Next steps:\n');
  console.log('1. Create the test database:');
  console.log('   Run this SQL command:');
  console.log('   CREATE DATABASE parking_system_test;\n');
  console.log('   Or using psql:');
  console.log(`   psql -h ${host} -p ${port} -U ${username} -d postgres -c "CREATE DATABASE parking_system_test;"\n`);
  
  console.log('2. Run migrations on test database:');
  console.log('   Windows (PowerShell):');
  console.log('   $env:DATABASE_URL=$env:DATABASE_URL_TEST');
  console.log('   npx prisma migrate deploy\n');
  console.log('   Linux/Mac:');
  console.log('   DATABASE_URL=$DATABASE_URL_TEST npx prisma migrate deploy\n');
  
  console.log('3. Run tests:');
  console.log('   npm test\n');

  console.log('✨ Setup complete!');
}

setupTestDatabase();
