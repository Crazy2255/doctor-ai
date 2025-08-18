# 🚀 Deployment Guide

This guide covers various deployment options for the Clinic Management System.

## 📋 Table of Contents
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Environment Variables](#environment-variables)
- [Security Considerations](#security-considerations)

## 🖥️ Local Development

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Git

### Setup
```bash
git clone https://github.com/yourusername/clinic-management-system.git
cd clinic-management-system
npm run install-all
npm run dev
```

## 🌐 Production Deployment

### Option 1: Traditional VPS/Server

#### Backend (Node.js)
```bash
# Install PM2 for process management
npm install -g pm2

# Build and start backend
cd backend-node
npm install --production
pm2 start server.js --name "clinic-backend"
```

#### Frontend (React)
```bash
cd frontend
npm install
npm run build

# Serve with nginx or apache
# Copy build folder to web server directory
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/clinic-frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: Heroku Deployment

#### Backend on Heroku
```bash
# Create Heroku app
heroku create clinic-backend-app

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set PORT=8000

# Deploy
git subtree push --prefix backend-node heroku main
```

#### Frontend on Netlify/Vercel
```bash
# Build command
npm run build

# Publish directory
build/

# Environment variables
REACT_APP_API_URL=https://clinic-backend-app.herokuapp.com
```

## 🐳 Docker Deployment

### Docker Compose Setup
Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  backend:
    build: ./backend-node
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./data:/app/data

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      - REACT_APP_API_URL=http://localhost:8000
```

### Docker Commands
```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

## ☁️ Cloud Deployment

### AWS Deployment

#### Using AWS Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli

# Initialize and deploy backend
cd backend-node
eb init
eb create clinic-backend-prod
eb deploy
```

#### Using AWS Amplify (Frontend)
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init
amplify add hosting
amplify publish
```

### Google Cloud Platform
```bash
# Deploy to App Engine
gcloud app deploy backend-node/app.yaml
gcloud app deploy frontend/app.yaml
```

### Microsoft Azure
```bash
# Deploy using Azure CLI
az webapp create --resource-group myResourceGroup --plan myAppServicePlan --name clinic-app
az webapp deployment source config --name clinic-app --resource-group myResourceGroup --repo-url https://github.com/username/clinic-management-system
```

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=8000
DB_PATH=./clinic.db
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=https://yourdomain.com
MAX_UPLOAD_SIZE=50mb
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
```

## 🔒 Security Considerations

### Essential Security Measures

1. **Environment Variables**
   - Never commit `.env` files
   - Use platform-specific secret management
   - Rotate keys regularly

2. **Database Security**
   - Enable WAL mode for SQLite
   - Regular backups
   - File permissions (600 for database file)

3. **API Security**
   - Implement rate limiting
   - Input validation and sanitization
   - CORS configuration
   - HTTPS enforcement

4. **Frontend Security**
   - Content Security Policy (CSP)
   - Secure headers
   - XSS protection

### Example Security Headers (Express.js)
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

## 📊 Monitoring & Maintenance

### Health Checks
```javascript
// Backend health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version 
  });
});
```

### Logging
```javascript
// Production logging with Winston
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Backup Strategy
```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp clinic.db "backup/clinic_backup_$DATE.db"

# Keep only last 30 days of backups
find backup/ -name "clinic_backup_*.db" -mtime +30 -delete
```

## 🚀 Performance Optimization

### Frontend Optimization
- Code splitting with React.lazy
- Image optimization and compression
- Service worker for caching
- Bundle analysis and optimization

### Backend Optimization
- Database indexing
- Connection pooling
- Caching strategies (Redis)
- Compression middleware

## 📞 Support

For deployment issues:
- Check the [troubleshooting guide](TROUBLESHOOTING.md)
- Create an issue with deployment logs
- Contact: mdv_ramees@ifza.com

---

**Note**: Always test deployments in a staging environment before production.
