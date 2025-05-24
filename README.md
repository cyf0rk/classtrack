# ClassTrack - Sports Class Management API

ClassTrack is a NestJS-based API for managing sports classes, user registrations, and class enrollments. It provides a complete solution for sports facilities to manage their classes, instructors, and student enrollments with role-based access control.

## 🌟 Features

- **User Management**
  - User registration and authentication
  - Role-based access control (Admin/User roles)
  - JWT-based authentication

- **Sports & Classes Management**
  - CRUD operations for sports categories
  - Class management with scheduling
  - Capacity tracking for classes
  - Class enrollment system

- **API Documentation**
  - Swagger/OpenAPI documentation
  - Interactive API testing interface

- **Database & ORM**
  - PostgreSQL database
  - Prisma ORM for type-safe database operations
  - Database migrations and seeding

- **Development & Production Ready**
  - Docker and Docker Compose support
  - Development and production configurations
  - Environment-based configuration
  - Comprehensive testing setup

## 🚀 Prerequisites

Before you begin, ensure you have the following installed:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (v22.14.0 or higher) - for local development without Docker
- [Git](https://git-scm.com/downloads)

## 🔧 Environment Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd classtrack
   ```

2. Create and configure your environment file:
   ```bash
   cp .env.example .env
   ```
   
   Required environment variables:
   ```
   # Application
   APP_PORT=3000
   JWT_SECRET=your-secret-key
   
   # Database
   DB_URL=postgresql://user:password@db:5432/db-name
   DB_NAME=db-name
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   DB_PORT=5432
   ```

## 🏃‍♂️ Running the Project

### Using Docker (Recommended)

1. **Development Mode**
   ```bash
   # Build and start the containers
   docker compose up --build
   
   # To run in detached mode
   docker compose up -d
   
   # To stop the containers
   docker compose down
   ```

2. **Production Mode**
   ```bash
   docker compose -f docker-compose.prod.yml up --build
   ```

### Local Development (Without Docker)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

3. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

4. Start the development server:
   ```bash
   npm run start:dev
   ```

## 📚 API Documentation

Once the application is running, you can access:
- API Documentation: http://localhost:3000/api
- API Base URL: http://localhost:3000

## 🗄️ Database Management

### Migrations

The project uses Prisma for database migrations. To manage your database schema:

```bash
# Create a new migration
npx prisma migrate dev --name <migration-name>

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Seeding

To seed the database with initial data:

```bash
npx prisma db seed
```

## 🧪 Testing

The project includes comprehensive testing setup:

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📁 Project Structure

```
classtrack/
├── src/
│   ├── modules/          # Feature modules
│   │   ├── auth/        # Authentication module
│   │   ├── user/        # User management
│   │   ├── sport/       # Sports management
│   │   └── class/       # Class management
│   ├── common/          # Shared resources
│   └── main.ts          # Application entry point
├── prisma/
│   ├── migrations/      # Database migrations
│   ├── schema.prisma    # Database schema
│   └── seed.ts         # Database seeder
├── test/               # Test files
├── docker-compose.yml  # Development Docker setup
└── docker-compose.prod.yml  # Production Docker setup
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Ensure ports 3000 (API) and 5432 (PostgreSQL) are available
   - Modify ports in `.env` if needed

2. **Database Connection Issues**
   - Check if the database container is running: `docker compose ps`
   - Verify database credentials in `.env`
   - Check database logs: `docker compose logs db`

3. **Container Issues**
   - Rebuild containers: `docker compose down && docker compose up --build`
   - Check container logs: `docker compose logs app`

### Logs

- Application logs: `docker compose logs app`
- Database logs: `docker compose logs db`
- Follow logs: `docker compose logs -f [service]`
