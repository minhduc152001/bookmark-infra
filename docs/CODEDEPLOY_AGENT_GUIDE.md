# CodeDeploy Agent Installation and Verification Guide

## CodeDeploy Agent Installation on Amazon Linux 2/EC2

### Installation Methods

#### Method 1: Using the Install Script (Recommended)
```bash
# Download the installer
wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install

# Make it executable
chmod +x ./install

# Install the agent
sudo ./install auto

# For specific region (replace us-west-2 with your region)
sudo ./install auto -v latest -r us-west-2
```

#### Method 2: Using YUM (Amazon Linux 2)
```bash
# Install Ruby if not already installed
sudo yum install -y ruby wget

# Download and install the agent
cd /home/ec2-user
wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install
chmod +x ./install
sudo ./install auto
```

## Important File Paths and Locations

### CodeDeploy Agent Files
- **Agent Installation Directory**: `/opt/codedeploy-agent/`
- **Agent Configuration**: `/etc/codedeploy-agent/conf/codedeployagent.yml`
- **Agent Executable**: `/opt/codedeploy-agent/bin/codedeploy-agent`

### Log Files
- **Main Agent Log**: `/var/log/aws/codedeploy-agent/codedeploy-agent.log`
- **Deployment Logs**: `/opt/codedeploy-agent/deployment-root/deployment-logs/`
- **Script Output Logs**: `/opt/codedeploy-agent/deployment-root/{deployment-id}/{deployment-group-id}/logs/scripts.log`

### Deployment Files
- **Deployment Archive Location**: `/opt/codedeploy-agent/deployment-root/{deployment-id}/`
- **Temporary Deployment Files**: `/opt/codedeploy-agent/deployment-root/deployment-instructions/`

## Verifying CodeDeploy Agent Status

### Check if Agent is Running
```bash
# Check service status
sudo service codedeploy-agent status

# Alternative method
sudo systemctl status codedeploy-agent

# Check if process is running
ps aux | grep codedeploy-agent
```

### Start/Stop/Restart Agent
```bash
# Start the agent
sudo service codedeploy-agent start

# Stop the agent
sudo service codedeploy-agent stop

# Restart the agent
sudo service codedeploy-agent restart

# Enable auto-start on boot
sudo systemctl enable codedeploy-agent
```

## Troubleshooting Common Issues

### 1. View Agent Logs
```bash
# View the main agent log
sudo tail -f /var/log/aws/codedeploy-agent/codedeploy-agent.log

# View last 100 lines
sudo tail -n 100 /var/log/aws/codedeploy-agent/codedeploy-agent.log

# Search for errors
sudo grep ERROR /var/log/aws/codedeploy-agent/codedeploy-agent.log
```

### 2. Check Agent Version
```bash
sudo /opt/codedeploy-agent/bin/codedeploy-agent version
```

### 3. Verify IAM Role
The EC2 instance must have an IAM role with the following permissions:
- `s3:GetObject` - To download deployment artifacts
- `s3:ListBucket` - To list deployment artifacts

Example policy:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::aws-codedeploy-*/*",
                "arn:aws:s3:::your-deployment-bucket/*"
            ]
        }
    ]
}
```

### 4. Check Agent Configuration
```bash
# View agent configuration
sudo cat /etc/codedeploy-agent/conf/codedeployagent.yml

# Default configuration includes:
# - :log_dir: '/var/log/aws/codedeploy-agent/'
# - :pid_dir: '/opt/codedeploy-agent/state/.pid/'
# - :program_name: codedeploy-agent
# - :root_dir: '/opt/codedeploy-agent/deployment-root'
# - :max_revisions: 5
```

### 5. Manual Agent Registration
If the agent isn't automatically registering:
```bash
# Register with AWS CodeDeploy
sudo /opt/codedeploy-agent/bin/codedeploy-agent register \
  --region your-region \
  --agent-id your-agent-id \
  --host your-deployment-host
```

## Common Log Messages and Their Meanings

### Successful Deployment Start
```
[Deployment] Deployment with ID ... has started
```

### Script Execution
```
[Deployment] Running script: scripts/before_install.sh
[Deployment] Script succeeded: scripts/before_install.sh
```

### Deployment Completion
```
[Deployment] Deployment with ID ... has completed successfully
```

### Common Errors
```
# Missing appspec.yml
ERROR [Deployment] The deployment failed because the application specification file (AppSpec file) is missing

# Permission issues
ERROR [Deployment] Script at specified location: scripts/application_start.sh failed with exit code 1

# IAM role issues
ERROR [Deployment] Unable to download bundle from S3: Access Denied
```

## Best Practices

1. **Regular Log Rotation**: Configure log rotation to prevent disk space issues
   ```bash
   # Add to /etc/logrotate.d/codedeploy-agent
   /var/log/aws/codedeploy-agent/*.log {
       daily
       rotate 7
       compress
       delaycompress
       missingok
       notifempty
   }
   ```

2. **Monitor Agent Health**: Set up CloudWatch alarms for agent failures
   ```bash
   # Check agent health every 5 minutes via cron
   */5 * * * * /usr/local/bin/check-codedeploy-health.sh
   ```

3. **Clean Up Old Deployments**: CodeDeploy keeps 5 deployments by default
   ```bash
   # Manually clean old deployments
   sudo rm -rf /opt/codedeploy-agent/deployment-root/[old-deployment-id]
   ```

4. **Backup Agent Configuration**: Keep a copy of your agent configuration
   ```bash
   sudo cp /etc/codedeploy-agent/conf/codedeployagent.yml ~/codedeployagent.yml.backup
   ```

## Quick Diagnostic Commands

```bash
# Full diagnostic check
echo "=== CodeDeploy Agent Status ==="
sudo service codedeploy-agent status

echo -e "\n=== Agent Version ==="
sudo /opt/codedeploy-agent/bin/codedeploy-agent version

echo -e "\n=== Recent Log Entries ==="
sudo tail -n 20 /var/log/aws/codedeploy-agent/codedeploy-agent.log

echo -e "\n=== Deployment Root Contents ==="
sudo ls -la /opt/codedeploy-agent/deployment-root/

echo -e "\n=== IAM Role ==="
curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/

echo -e "\n=== Disk Space ==="
df -h /opt/codedeploy-agent/
```

## References

- [AWS CodeDeploy Agent Operations](https://docs.aws.amazon.com/codedeploy/latest/userguide/codedeploy-agent-operations.html)
- [Troubleshooting CodeDeploy](https://docs.aws.amazon.com/codedeploy/latest/userguide/troubleshooting.html)
- [CodeDeploy Agent Configuration Reference](https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-agent-configuration.html)