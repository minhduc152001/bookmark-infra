# Bookmark Management API

A full-featured RESTful API for bookmark management with user authentication, file uploads, and AWS cloud deployment.

## 🛠️ Tech Stack Overview

### Backend Framework
- **NestJS v11** - Enterprise-grade Node.js framework with modular architecture
- **TypeScript** - Static typing for JavaScript
- **Node.js v20** - JavaScript runtime environment

### Database & ORM
- **PostgreSQL** - Relational database for data persistence
- **Prisma ORM v6** - Type-safe database client with migrations
- **UUID** - Primary keys for better scalability

### Authentication & Security
- **JWT (JSON Web Tokens)** - Stateless authentication with 60-minute expiry
- **Passport.js** - Authentication middleware with JWT strategy
- **Argon2** - Password hashing (winner of Password Hashing Competition)
- **Class Validator** - DTO validation with decorators
- **CORS** - Cross-origin resource sharing enabled

### File Storage & Upload
- **AWS S3** - Cloud object storage for file uploads
- **Multer** - Multipart form data handling
- **Presigned URLs** - Secure, temporary file access

### Testing Infrastructure
- **Jest** - Unit and integration testing framework
- **Pactum** - E2E API testing library
- **Test Database** - Isolated PostgreSQL instance for tests
- **Coverage Reports** - Code coverage analysis

### Development Tools
- **ESLint** - Code linting with TypeScript support
- **Prettier** - Code formatting
- **Nodemon** - Development server with hot reload
- **SWC** - Fast TypeScript compilation

### Production Infrastructure (AWS)
- **EC2** - Application hosting on Amazon Linux 2
- **RDS PostgreSQL** - Managed database service
- **Application Load Balancer (ALB)** - Traffic distribution & health checks
- **Route 53** - DNS management
- **ACM** - SSL/TLS certificates

### CI/CD Pipeline
- **GitHub** - Source code repository
- **AWS CodePipeline** - Automated deployment pipeline
- **AWS CodeBuild** - Build and test automation
- **AWS CodeDeploy** - Zero-downtime deployments
- **S3** - Artifact storage

### Process Management & Web Server
- **PM2** - Node.js process manager with clustering
- **Nginx** - Reverse proxy and static file serving
- **Systemd** - Service management on Linux

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x
- PostgreSQL 15.x
- AWS Account (for production features)

### Local Development
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run start:dev
```

### Production Build
```bash
# Build the application
npm run build

# Generate Prisma client for production
npx prisma generate

# Run production server
npm run start:prod
```

## 📁 Project Architecture

```
src/
├── auth/                 # JWT authentication module
│   ├── decorator/       # @GetUser() decorator
│   ├── dto/            # Login/Signup DTOs
│   ├── guard/          # JWT AuthGuard
│   └── strategy/       # Passport JWT strategy
├── bookmark/            # Bookmark CRUD operations
│   ├── dto/            # Bookmark DTOs
│   └── bookmark.service.ts # Business logic with S3 integration
├── prisma/              # Database abstraction layer
├── upload/              # S3 file upload service
├── user/                # User profile management
└── health/              # Health check for ALB

prisma/
├── schema.prisma        # Database schema definition
└── migrations/          # Database migration history

scripts/                 # AWS CodeDeploy lifecycle scripts
├── before_install.sh
├── after_install.sh
├── application_start.sh
├── application_stop.sh
└── validate_service.sh
```

## 🔐 Security Features

- Password hashing with Argon2
- JWT token-based authentication
- Request validation and sanitization
- Environment-based configuration
- Secure file access with presigned URLs
- HTTPS enforcement in production

## 🌐 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/user` | Get current user | Yes |
| PATCH | `/user` | Update user profile | Yes |
| GET | `/bookmark` | List user bookmarks | Yes |
| GET | `/bookmark/:id` | Get bookmark details | Yes |
| POST | `/bookmark` | Create bookmark (with file) | Yes |
| PATCH | `/bookmark/:id` | Update bookmark | Yes |
| DELETE | `/bookmark/:id` | Delete bookmark | Yes |
| GET | `/health` | Health check | No |

## 🚢 Production Deployment

The application is designed for AWS deployment with:
- Auto-scaling capabilities
- Zero-downtime deployments
- Automated CI/CD pipeline
- Health monitoring
- SSL/TLS encryption

See [AWS Deployment Guide](docs/AWS_DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📊 Performance Features

- Database connection pooling
- PM2 cluster mode
- Nginx caching
- Optimized Prisma queries
- AWS CDN for static assets

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 License

This project is [MIT licensed](LICENSE).