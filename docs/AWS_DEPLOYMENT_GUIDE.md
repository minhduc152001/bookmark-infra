# AWS Deployment Guide for Bookmark App

## Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Route 53  │────▶│ Load Balancer│────▶│  EC2 (App)  │
└─────────────┘     └──────────────┘     └─────────────┘
                                                  │
                                                  ▼
                                          ┌─────────────┐
                                          │     RDS     │
                                          │ PostgreSQL  │
                                          └─────────────┘
                                                  
┌──────────────┐    ┌──────────────┐     ┌─────────────┐
│    GitHub    │───▶│ CodePipeline │────▶│ CodeDeploy  │
└──────────────┘    └──────────────┘     └─────────────┘
```

## Prerequisites

- AWS Account with appropriate permissions
- Domain registered in Route 53
- GitHub repository
- AWS CLI installed locally
- Node.js 20+ on EC2

## Step 1: Set up RDS PostgreSQL

### 1.1 Create RDS Instance

1. Go to AWS RDS Console
2. Create database with these settings:
   - Engine: PostgreSQL 15
   - Template: Free tier (for testing) or Production
   - DB Instance identifier: `bookmark-app-db`
   - Master username: `postgres`
   - Master password: (choose a strong password)
   - DB instance class: `db.t3.micro` (free tier) or `db.t3.small`
   - Storage: 20 GB SSD
   - VPC: Default VPC
   - Public access: No (for security)
   - Database name: `bookmark_app`

### 1.2 Configure Security Group

1. Edit RDS security group
2. Add inbound rule:
   - Type: PostgreSQL
   - Port: 5432
   - Source: EC2 security group (will create later)

## Step 2: Set up EC2 Instance

### 2.1 Launch EC2 Instance

1. Go to EC2 Console
2. Launch instance with:
   - AMI: Amazon Linux 2023 or Ubuntu 22.04
   - Instance type: `t3.micro` (free tier) or `t3.small`
   - Key pair: Create new or use existing
   - Network settings:
     - VPC: Same as RDS
     - Auto-assign public IP: Enable
   - Security group: Create new with rules:
     - SSH (22) from your IP
     - HTTP (80) from ALB security group
     - HTTPS (443) from ALB security group
     - Custom TCP (3000) from ALB security group
   - Storage: 20 GB

### 2.2 Connect and Setup EC2

```bash
# Connect to EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Update system
sudo yum update -y  # For Amazon Linux
# or
sudo apt update && sudo apt upgrade -y  # For Ubuntu

# Install Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs  # Amazon Linux
# or
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs  # Ubuntu

# Install PM2
sudo npm install -g pm2

# Install nginx
sudo yum install -y nginx  # Amazon Linux
# or
sudo apt install -y nginx  # Ubuntu

# Install CodeDeploy agent
wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install
chmod +x ./install
sudo ./install auto
```

## Step 3: Configure Application

### 3.1 Create deployment directories

```bash
sudo mkdir -p /var/www/bookmark-app
sudo chown -R ec2-user:ec2-user /var/www/bookmark-app
```

### 3.2 Configure PM2

Create `/var/www/bookmark-app/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'bookmark-app',
    script: './dist/main.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### 3.3 Configure Nginx

Create `/etc/nginx/sites-available/bookmark-app`:

```nginx
server {
    listen 80;
    server_name your-subdomain.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://localhost:3000/health;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/bookmark-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 4: Set up Application Load Balancer

1. Go to EC2 > Load Balancers
2. Create Application Load Balancer:
   - Name: `bookmark-app-alb`
   - Scheme: Internet-facing
   - IP address type: IPv4
   - Network mapping: Select at least 2 AZs
   - Security group: Create new with:
     - HTTP (80) from anywhere
     - HTTPS (443) from anywhere

3. Configure Target Group:
   - Target type: Instances
   - Protocol: HTTP
   - Port: 80
   - Health check path: `/health`
   - Register your EC2 instance

## Step 5: Configure CodePipeline

### 5.1 Create S3 bucket for artifacts

```bash
aws s3 mb s3://bookmark-app-codepipeline-artifacts-{random-suffix}
```

### 5.2 Create CodeDeploy Application

1. Go to CodeDeploy console
2. Create application:
   - Name: `bookmark-app`
   - Compute platform: EC2/On-premises

3. Create deployment group:
   - Name: `production`
   - Service role: Create with CodeDeploy permissions
   - Deployment type: In-place
   - Environment configuration: EC2 instances
   - Tag group: Add tags to identify your EC2

### 5.3 Create CodePipeline

1. Go to CodePipeline console
2. Create pipeline:
   - Name: `bookmark-app-pipeline`
   - Service role: New service role
   - Artifact store: S3 bucket created above

3. Add source stage:
   - Provider: GitHub (Version 2)
   - Connect to GitHub
   - Repository: Your repo
   - Branch: main

4. Add build stage:
   - Provider: AWS CodeBuild
   - Create build project (see build spec below)

5. Add deploy stage:
   - Provider: AWS CodeDeploy
   - Application: bookmark-app
   - Deployment group: production

## Step 6: Configure Route 53

1. Go to Route 53 console
2. Select your hosted zone
3. Create record:
   - Record name: your-subdomain
   - Record type: A
   - Alias: Yes
   - Route traffic to: Application Load Balancer
   - Select your ALB
   - Routing policy: Simple

## Step 7: SSL Certificate (Optional but Recommended)

1. Go to ACM (Certificate Manager)
2. Request certificate for your subdomain
3. Validate via DNS
4. Attach to ALB listener on port 443

## Environment Variables

Set these in your EC2 instance:

```bash
# /var/www/bookmark-app/.env.production
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:password@rds-endpoint:5432/bookmark_app
JWT_SECRET=your-secure-jwt-secret
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=your-s3-bucket
```

## Monitoring

1. CloudWatch Logs: Set up log groups for application logs
2. CloudWatch Alarms: CPU, memory, disk usage
3. RDS Monitoring: Connection count, CPU, storage
4. ALB Monitoring: Request count, target health

## Security Best Practices

1. Use IAM roles instead of access keys when possible
2. Enable RDS encryption
3. Use Parameter Store or Secrets Manager for sensitive data
4. Regular security updates
5. Enable AWS WAF on ALB
6. Use VPC endpoints for S3 access