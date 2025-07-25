# Quick Deployment Guide

## Prerequisites Checklist
- [ ] AWS account with admin access
- [ ] Domain in Route 53
- [ ] GitHub repository with code pushed
- [ ] AWS CLI configured locally

## Step-by-Step Deployment

### 1. Create RDS Database (10 mins)
```bash
# Note the endpoint after creation: xxx.yyy.region.rds.amazonaws.com
# Save the master password securely
```

### 2. Launch EC2 Instance (5 mins)
- Use Amazon Linux 2023 or Ubuntu 22.04
- t3.micro for testing, t3.small for production
- Security group: Allow 22 (SSH), 80 (HTTP), 443 (HTTPS), 3000 (App)

### 3. Setup EC2 (15 mins)
```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Run setup commands
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs nginx git
sudo npm install -g pm2

# Install CodeDeploy agent
wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install
chmod +x ./install
sudo ./install auto

# Create app directory
sudo mkdir -p /var/www/bookmark-app
sudo chown -R ec2-user:ec2-user /var/www/bookmark-app

# Create environment file
cat > ~/.env.production << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_RDS_ENDPOINT:5432/bookmark_app
JWT_SECRET=your-secure-jwt-secret
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_BUCKET_NAME=your-bucket
EOF
```

### 4. Create S3 Bucket for Files (2 mins)
```bash
aws s3 mb s3://your-bookmark-files-bucket --region your-region
```

### 5. Create IAM Role for EC2 (5 mins)
- Create role with policies:
  - AmazonEC2RoleforAWSCodeDeploy
  - AmazonS3ReadOnlyAccess (for CodeDeploy artifacts)
  - Custom S3 policy for your files bucket
- Attach to EC2 instance

### 6. Setup Load Balancer (10 mins)
1. Create Application Load Balancer
2. Create target group (port 80, health check: /health)
3. Register EC2 instance
4. Add listener rules

### 7. Setup CodePipeline (15 mins)
1. Create S3 bucket for artifacts: `bookmark-app-artifacts-{random}`
2. Create CodeDeploy application and deployment group
3. Create CodeBuild project (use buildspec.yml)
4. Create pipeline: GitHub → CodeBuild → CodeDeploy

### 8. Configure Nginx on EC2
```bash
sudo tee /etc/nginx/conf.d/bookmark-app.conf << EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /health {
        proxy_pass http://localhost:3000/health;
    }
}
EOF

sudo systemctl restart nginx
```

### 9. Configure Route 53 (5 mins)
1. Create A record
2. Alias to your ALB
3. Wait for DNS propagation

### 10. SSL Certificate (10 mins)
1. Request certificate in ACM for your subdomain
2. Validate via DNS
3. Add HTTPS listener to ALB with certificate

## First Deployment
1. Push code to GitHub
2. CodePipeline will automatically:
   - Build the application
   - Deploy to EC2
   - Start with PM2
3. Monitor in CodePipeline console

## Verify Deployment
```bash
# Check application
curl http://your-subdomain.domain.com/health

# Check logs on EC2
pm2 logs bookmark-app
tail -f /var/log/bookmark-app/out.log

# Check nginx
sudo systemctl status nginx
```

## Troubleshooting
- **Build fails**: Check CodeBuild logs
- **Deploy fails**: Check CodeDeploy logs and EC2 instance
- **App not accessible**: Check security groups, target health, nginx
- **Database connection**: Verify RDS security group allows EC2

## Important Files
- `/var/www/bookmark-app/` - Application directory
- `~/.env.production` - Environment variables
- `/var/log/bookmark-app/` - Application logs
- `/etc/nginx/conf.d/bookmark-app.conf` - Nginx config