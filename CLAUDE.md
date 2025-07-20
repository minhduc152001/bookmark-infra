# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a NestJS application that implements a bookmark management system with user authentication. The project uses:
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport
- **Password Hashing**: Argon2
- **Testing**: Jest with Pactum for E2E tests

## Essential Commands

### Development
```bash
# Install dependencies
npm install

# Run development server (watches for changes)
npm run start:dev

# Run production build
npm run build
npm run start:prod

# Run with debugging
npm run start:debug
```

### Database Management
```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name <migration-name>

# Apply migrations to test database
dotenv -e .env.test -- prisma migrate deploy

# Open Prisma Studio to browse database
npx prisma studio
```

### Testing
```bash
# Run unit tests
npm run test

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with coverage
npm run test:cov

# Run E2E tests (uses .env.test configuration)
npm run test:e2e

# Debug tests
npm run test:debug
```

### Code Quality
```bash
# Run ESLint (auto-fixes issues)
npm run lint

# Format code with Prettier
npm run format
```

## High-Level Architecture

### Module Structure
The application follows NestJS's modular architecture with feature-based organization:

```
src/
├── app.module.ts        # Root module importing all features
├── auth/                # Authentication module
│   ├── decorator/       # Custom decorators (@GetUser)
│   ├── dto/            # Validation DTOs
│   ├── guard/          # JWT authentication guard
│   └── strategy/       # Passport JWT strategy
├── bookmark/           # Bookmark CRUD operations
├── prisma/             # Database service wrapper
└── user/               # User management
```

### Authentication Flow
1. **Registration**: POST `/auth/signup` → Hash password with Argon2 → Create user → Return user data
2. **Login**: POST `/auth/login` → Verify password → Generate JWT (60min expiry) → Return token
3. **Protected Routes**: Use `@UseGuards(JwtGuard)` → Extract JWT from Bearer token → Validate and populate user

### Database Models
- **User**: id, email (unique), hash, firstName?, lastName?, bookmarks[], timestamps
- **Bookmark**: id, title, link, description?, userId, user, timestamps

### Key Patterns

#### Dependency Injection
- Services are injected via constructor
- PrismaService is globally available
- ConfigService provides environment variables

#### Request Validation
- DTOs use class-validator decorators
- Global ValidationPipe with whitelist enabled
- Automatic validation and type transformation

#### Error Handling
- Prisma errors (e.g., unique constraints) are caught and transformed
- Guards return 401 for unauthorized requests
- Validation errors return 400 with details

#### Testing Strategy
- E2E tests focus on API behavior
- Test database is cleaned before each test run
- Separate environment configuration for tests

### Environment Configuration
Required environment variables:
- `PORT`: Server port (default: 3000)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT signing

### Security Considerations
- Passwords hashed with Argon2
- JWT tokens expire after 60 minutes
- Password hash excluded from API responses
- Input validation on all endpoints