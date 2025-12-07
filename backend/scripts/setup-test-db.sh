#!/bin/bash
# Bash script to set up test database
# Run this script to create the test database and run migrations

echo "Setting up test database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL is not set in your .env file"
    echo "Please add DATABASE_URL to your .env file first"
    exit 1
fi

# Extract connection details from DATABASE_URL
# Format: postgresql://username:password@host:port/database
if [[ $DATABASE_URL =~ postgresql://([^:]+):([^@]+)@([^:]+):([0-9]+)/(.+) ]]; then
    USERNAME="${BASH_REMATCH[1]}"
    PASSWORD="${BASH_REMATCH[2]}"
    HOST="${BASH_REMATCH[3]}"
    PORT="${BASH_REMATCH[4]}"
    DATABASE="${BASH_REMATCH[5]}"
    
    echo "Detected database connection:"
    echo "  Host: $HOST"
    echo "  Port: $PORT"
    echo "  Username: $USERNAME"
    echo "  Database: $DATABASE"
    
    # Create test database URL
    TEST_DB_URL="postgresql://${USERNAME}:${PASSWORD}@${HOST}:${PORT}/parking_system_test"
    
    echo ""
    echo "Test database URL will be:"
    echo "  $TEST_DB_URL"
    
    # Check if DATABASE_URL_TEST already exists in .env
    if [ -f .env ]; then
        if grep -q "DATABASE_URL_TEST" .env; then
            echo ""
            echo "DATABASE_URL_TEST already exists in .env file"
            echo "Updating it..."
            sed -i.bak "s|DATABASE_URL_TEST=.*|DATABASE_URL_TEST=$TEST_DB_URL|" .env
        else
            echo ""
            echo "Adding DATABASE_URL_TEST to .env file..."
            echo "" >> .env
            echo "DATABASE_URL_TEST=$TEST_DB_URL" >> .env
        fi
    else
        echo ""
        echo "Creating .env file with DATABASE_URL_TEST..."
        echo "DATABASE_URL_TEST=$TEST_DB_URL" > .env
    fi
    
    echo ""
    echo "DATABASE_URL_TEST has been added to .env file"
    
    # Create test database using psql
    echo ""
    echo "Creating test database..."
    echo "You may need to run this SQL command manually:"
    echo "  CREATE DATABASE parking_system_test;"
    
    echo ""
    echo "Or run this command:"
    echo "  PGPASSWORD=$PASSWORD psql -h $HOST -p $PORT -U $USERNAME -d postgres -c 'CREATE DATABASE parking_system_test;'"
    
    # Ask user if they want to run migrations
    echo ""
    echo "Next steps:"
    echo "1. Create the database (run the SQL command above)"
    echo "2. Run migrations: DATABASE_URL=\$DATABASE_URL_TEST npx prisma migrate deploy"
    echo "3. Run tests: npm test"
    
else
    echo "ERROR: Could not parse DATABASE_URL format"
    echo "Expected format: postgresql://username:password@host:port/database"
    exit 1
fi
