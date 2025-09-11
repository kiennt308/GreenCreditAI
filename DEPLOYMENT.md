# GreenCredit AI - Deployment Guide

## 🚀 Production Deployment

### Prerequisites

- Node.js 20+
- Python 3.8+
- Docker & Docker Compose
- MongoDB (for production)
- Ethereum node access (Infura/Alchemy)
- Domain name and SSL certificate

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Blockchain Configuration
CONTRACT_ADDRESS=0x102a95bf109E80D130858B19a5419e65f858583d
ACCOUNT=your_production_ethereum_account
PRIVATE_KEY=your_production_private_key

# Server Configuration
PORT=3001
NODE_ENV=production

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/greencredit_prod

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRES_IN=1h

# API Keys
WORLD_BANK_API_KEY=your_world_bank_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Docker Production Setup

1. **Update docker-compose.yml for production:**

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - CONTRACT_ADDRESS=${CONTRACT_ADDRESS}
      - ACCOUNT=${ACCOUNT}
      - PRIVATE_KEY=${PRIVATE_KEY}
      - MONGODB_URI=mongodb://mongo:27017/greencredit_prod
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=https://api.yourdomain.com
    depends_on:
      - backend
    restart: unless-stopped

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=greencredit_prod
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  mongo_data:
```

2. **Create nginx.conf:**

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3001;
    }

    upstream frontend {
        server frontend:3000;
    }

    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location /api/ {
            proxy_pass http://backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location / {
            proxy_pass http://frontend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### Deployment Steps

1. **Clone and setup:**
```bash
git clone <repository-url>
cd GreenCreditAI
chmod +x setup.sh
./setup.sh
```

2. **Update environment variables:**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with production values
```

3. **Deploy with Docker:**
```bash
docker-compose up -d
```

4. **Verify deployment:**
```bash
# Check services
docker-compose ps

# Check logs
docker-compose logs -f

# Test endpoints
curl https://yourdomain.com/api/health
```

### Database Migration

1. **Backup existing data:**
```bash
mongodump --db greencredit --out backup/
```

2. **Migrate to production:**
```bash
mongorestore --db greencredit_prod backup/greencredit/
```

### Security Checklist

- [ ] Change default JWT secret
- [ ] Use strong passwords for all accounts
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Regular security updates
- [ ] Database encryption at rest
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] Environment variables secured

### Monitoring

1. **Health checks:**
```bash
# Backend health
curl https://api.yourdomain.com/health

# Database health
curl https://api.yourdomain.com/health/db
```

2. **Log monitoring:**
```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

3. **Performance monitoring:**
- Set up Prometheus + Grafana
- Monitor API response times
- Track blockchain transaction success rates
- Monitor database performance

### Scaling

1. **Horizontal scaling:**
```yaml
# Scale backend services
docker-compose up -d --scale backend=3
```

2. **Load balancing:**
- Use nginx for load balancing
- Implement Redis for session storage
- Use MongoDB replica sets

3. **CDN setup:**
- Use CloudFlare or AWS CloudFront
- Cache static assets
- Implement edge caching

### Backup Strategy

1. **Database backups:**
```bash
# Daily backup script
#!/bin/bash
mongodump --db greencredit_prod --out /backups/$(date +%Y%m%d)/
```

2. **Application backups:**
```bash
# Backup application data
tar -czf app-backup-$(date +%Y%m%d).tar.gz /app/data/
```

### Maintenance

1. **Regular updates:**
```bash
# Update dependencies
docker-compose pull
docker-compose up -d
```

2. **Database maintenance:**
```bash
# Optimize database
mongo greencredit_prod --eval "db.runCommand({compact: 'users'})"
```

3. **Log rotation:**
```bash
# Configure logrotate for application logs
```

### Troubleshooting

1. **Common issues:**
- Check environment variables
- Verify blockchain connectivity
- Check database connection
- Review application logs

2. **Performance issues:**
- Monitor resource usage
- Check database queries
- Review API response times
- Optimize blockchain calls

### Support

For production support:
- Email: support@greencredit.ai
- Documentation: https://docs.greencredit.ai
- Status page: https://status.greencredit.ai
